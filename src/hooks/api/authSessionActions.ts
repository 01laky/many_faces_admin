/**
 * Auth/session side effects kept outside `useAuthApi` so the same flows are testable with injected
 * `Storage` and without mounting React Query. Mirrors `many_faces_portal/src/hooks/api/authSessionActions.ts`.
 */
import { AuthService, OAuth2Service, ApiError } from '../../api';
import type { OAuth2TokenRequest, RegisterModel } from '../../api';
import { setAuthToken } from '../../api/config';
import { logger } from '../../utils/logger';
import { isTokenExpired } from '../../utils/jwtUtils';
import { env } from '../../config/env';
import { buildPasswordGrantTokenRequest } from './authTokenRequest';
import {
	type AuthWebStorage,
	clearAuthStorage,
	getAccessTokenFromStorage,
	getRefreshTokenFromStorage,
	persistAccessToken,
	persistRefreshToken,
} from '../../utils/authStorage';

export type { AuthWebStorage } from '../../utils/authStorage';

/** Registration API wrapper; React Query hook decides how to invalidate caches after success. */
export async function registerUser(data: RegisterModel): Promise<unknown> {
	logger.info('Registering user', { email: data.email });
	return AuthService.postApiAuthRegister({ requestBody: data });
}

/**
 * Password grant login: builds RFC-like OAuth2 body via `buildPasswordGrantTokenRequest`, posts to
 * `/api/oauth2/token`, persists tokens, and mirrors access token into axios (`setAuthToken`).
 * Maps `ApiError` payloads to a thrown `Error` string for toast-friendly handling in hooks.
 */
export async function runPasswordGrantLogin(
	credentials: {
		username: string;
		password: string;
		rememberMe?: boolean;
	},
	storage: AuthWebStorage = localStorage
): Promise<{ accessToken: string; refreshToken?: string }> {
	logger.info('Attempting login', { username: credentials.username });

	const tokenRequest = buildPasswordGrantTokenRequest({
		username: credentials.username,
		password: credentials.password,
		rememberMe: credentials.rememberMe,
		clientId: env.oauth2ClientId,
		clientSecret: env.oauth2ClientSecret,
	});

	let response;
	try {
		response = await OAuth2Service.postApiOauth2Token({
			requestBody: tokenRequest,
		});
	} catch (error) {
		if (error instanceof ApiError) {
			const errorMessage =
				error.body?.errorDescription ||
				error.body?.error ||
				error.body?.message ||
				error.message ||
				'Login failed';
			throw new Error(errorMessage, { cause: error });
		}
		throw error;
	}

	const tokenData = response as unknown as {
		accessToken?: string;
		refreshToken?: string;
		token?: string;
	};
	const accessToken = tokenData.accessToken || tokenData.token;

	if (!accessToken) {
		throw new Error('No access token received from server');
	}

	persistAccessToken(accessToken, storage);
	if (tokenData.refreshToken) {
		persistRefreshToken(tokenData.refreshToken, storage);
	}

	return {
		accessToken,
		refreshToken: tokenData.refreshToken,
	};
}

/**
 * Source of truth for `useAuthToken` query: loads JWT from storage, applies expiry policy, keeps axios
 * header in sync, and wipes stale refresh material when the access token is unusable.
 */
export function readAuthTokenQueryValue(
	storage: AuthWebStorage = localStorage,
	tokenExpired: (jwt: string) => boolean = isTokenExpired,
	applyAuthToken: (t: string | null) => void = setAuthToken
): { accessToken: string } | null {
	const token = getAccessTokenFromStorage(storage);
	if (!token || tokenExpired(token)) {
		if (token) {
			clearAuthStorage(storage, applyAuthToken);
		}
		return null;
	}
	applyAuthToken(token);
	return { accessToken: token };
}

/** Clears bearer header and all auth-related storage entries (logout / forced session end). */
export function clearLocalAuthSession(
	storage: AuthWebStorage = localStorage,
	applyAuthToken: (t: string | null) => void = setAuthToken
): void {
	clearAuthStorage(storage, applyAuthToken);
	logger.info('User logged out');
}

/**
 * Silent refresh: requires refresh token in storage. Persists rotated tokens when the API returns a
 * new refresh token string; callers invalidate capability queries after success.
 */
export async function runRefreshGrantLogin(
	storage: AuthWebStorage = localStorage
): Promise<{ accessToken: string; refreshToken?: string }> {
	const refreshToken = getRefreshTokenFromStorage(storage);
	if (!refreshToken) {
		throw new Error('No refresh token available');
	}

	logger.info('Refreshing token');

	const tokenRequest: OAuth2TokenRequest = {
		grantType: 'refresh_token',
		refreshToken,
		clientId: env.oauth2ClientId,
		clientSecret: env.oauth2ClientSecret,
	};

	const response = await OAuth2Service.postApiOauth2Token({
		requestBody: tokenRequest,
	});

	const tokenData = response as unknown as {
		accessToken?: string;
		refreshToken?: string;
		token?: string;
	};
	const accessToken = tokenData.accessToken || tokenData.token;

	if (!accessToken) {
		throw new Error('No access token received from server');
	}

	persistAccessToken(accessToken, storage);
	if (tokenData.refreshToken) {
		persistRefreshToken(tokenData.refreshToken, storage);
	}

	return {
		accessToken,
		refreshToken: tokenData.refreshToken,
	};
}
