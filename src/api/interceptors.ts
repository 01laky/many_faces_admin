/**
 * Axios response interceptors for automatic token refresh and forced logout.
 *
 * When any API call returns 401 (Unauthorized):
 * 1. Attempt to refresh the access token using the stored refresh token.
 * 2. If refresh succeeds → retry the original request with the new token.
 * 3. If refresh fails (or no refresh token exists) → clear auth state and redirect to login.
 *
 * Concurrent 401s are queued so that only one refresh request is made at a time.
 *
 * This module operates outside the React tree (no hooks/context) so it can be
 * initialised in main.tsx right after configureApiClient().
 */

import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { OpenAPI } from './core/OpenAPI';
import { setAuthToken } from './config';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import {
	assertAdminAppAccessAllowed,
	forcePlatformAccessDeniedLogout,
} from '../utils/adminAppAccess';

/* ------------------------------------------------------------------ */
/*  Internal state                                                     */
/* ------------------------------------------------------------------ */

/** Whether a token-refresh request is already in-flight. */
let isRefreshing = false;

/** Queue of requests waiting for the current refresh to finish. */
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: unknown) => void;
}> = [];

/** Drain the queue after a refresh attempt finishes. */
const processQueue = (error: unknown, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token!);
		}
	});
	failedQueue = [];
};

/** True when the request targets the admin face API base (not OAuth or other hosts). */
function isAdminScopedApiRequest(config: AxiosRequestConfig | InternalAxiosRequestConfig): boolean {
	const rawUrl = config.url ?? '';
	if (rawUrl.includes('/oauth2/token')) return false;
	const base = env.apiUrl.replace(/\/+$/, '');
	const absolute = rawUrl.startsWith('http')
		? rawUrl
		: `${base}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
	return absolute.startsWith(base);
}

/* ------------------------------------------------------------------ */
/*  Force-logout (outside React)                                       */
/* ------------------------------------------------------------------ */

/**
 * Clear every piece of auth state and redirect to the login page.
 * Called when the refresh token itself is invalid / missing.
 */
function forceLogout() {
	logger.warn('Token refresh failed – forcing logout');

	// Clear API client token
	setAuthToken(null);

	// Clear localStorage
	localStorage.removeItem('auth_token');
	localStorage.removeItem('auth_refresh_token');
	localStorage.removeItem('auth_user');

	// Redirect to login – pick up the current language prefix if possible
	const langMatch = window.location.pathname.match(/^\/([a-z]{2})\//);
	const lang = langMatch?.[1] ?? 'en';
	window.location.href = `/${lang}/login`;
}

/* ------------------------------------------------------------------ */
/*  Interceptor setup                                                  */
/* ------------------------------------------------------------------ */

/** Extended config so we can tag a retried request. */
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
}

/**
 * Call once at application startup (after configureApiClient).
 * Registers a global axios response interceptor.
 */
export function setupAxiosInterceptors() {
	axios.interceptors.response.use(
		// Successful responses pass through unchanged.
		(response) => response,

		// Error responses — look for 401.
		async (error: AxiosError) => {
			const originalRequest = error.config as RetryableRequestConfig | undefined;

			// Safety: if there is no config we cannot retry.
			if (!originalRequest) {
				return Promise.reject(error);
			}

			// Platform 403 on admin API — session is invalid for this SPA (stale ADMIN JWT, demoted role).
			if (error.response?.status === 403 && isAdminScopedApiRequest(originalRequest)) {
				forcePlatformAccessDeniedLogout();
				return Promise.reject(error);
			}

			// Only act on 401 and only once per request.
			if (error.response?.status !== 401 || originalRequest._retry) {
				return Promise.reject(error);
			}

			// Never intercept the token endpoint itself (prevents infinite loop).
			if (originalRequest.url?.includes('/oauth2/token')) {
				return Promise.reject(error);
			}

			// If a refresh is already running, queue this request.
			if (isRefreshing) {
				return new Promise<string>((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				}).then((newToken) => {
					originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
					return axios(originalRequest as AxiosRequestConfig);
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const refreshToken = localStorage.getItem('auth_refresh_token');

			if (!refreshToken) {
				isRefreshing = false;
				processQueue(error);
				forceLogout();
				return Promise.reject(error);
			}

			try {
				// Call the token endpoint directly with axios (not through the
				// generated client) to avoid going through CancelablePromise /
				// catchErrorCodes which would also throw on 401.
				const response = await axios.post(
					`${OpenAPI.BASE}/api/oauth2/token`,
					{
						grantType: 'refresh_token',
						refreshToken,
						clientId: env.oauth2ClientId,
						clientSecret: env.oauth2ClientSecret,
					},
					{
						headers: { 'Content-Type': 'application/json' },
						// Mark so the interceptor does not re-process this request.
						// (URL check above already covers it, but belt-and-suspenders.)
					}
				);

				const tokenData = response.data;
				const newAccessToken: string | undefined =
					tokenData?.accessToken ?? tokenData?.token;

				if (!newAccessToken) {
					throw new Error('No access token in refresh response');
				}

				// Persist the new tokens.
				setAuthToken(newAccessToken);
				localStorage.setItem('auth_token', newAccessToken);
				if (tokenData.refreshToken) {
					localStorage.setItem('auth_refresh_token', tokenData.refreshToken);
				}

				logger.info('Token refreshed via interceptor');

				const allowed = await assertAdminAppAccessAllowed(newAccessToken);
				if (!allowed) {
					forcePlatformAccessDeniedLogout();
					return Promise.reject(new Error('Platform access denied after token refresh'));
				}

				// Drain queued requests with the new token.
				processQueue(null, newAccessToken);

				// Retry the original request.
				originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
				return axios(originalRequest as AxiosRequestConfig);
			} catch (refreshError) {
				processQueue(refreshError);
				forceLogout();
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}
	);
}
