import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { OpenAPI } from './core/OpenAPI';
import { env } from '../config/env';
import { applyFacePrefixToRequestUrl } from './faceApiRouting';

let interceptorsSetup = false;

/** ASH1-B4 — HTTPS admin pages must not call plain HTTP API origins (mixed content). */
export function assertNoMixedContentApi(
	apiUrl: string,
	pageProtocol: string = typeof window !== 'undefined' ? window.location.protocol : 'https:'
): void {
	if (pageProtocol === 'https:' && apiUrl.startsWith('http://')) {
		throw new Error(
			'Mixed content blocked: HTTPS admin page cannot call HTTP API URL. Set VITE_API_URL to https://…'
		);
	}
}

/**
 * Configure API client with base URL from environment variables
 * This should be called once when the app starts
 */
export function configureApiClient() {
	if (typeof window !== 'undefined') {
		assertNoMixedContentApi(env.apiUrl);
	}

	// Configure OpenAPI client
	OpenAPI.BASE = env.apiUrl;
	OpenAPI.WITH_CREDENTIALS = false;
	OpenAPI.CREDENTIALS = 'include';

	// You can set default headers here if needed
	OpenAPI.HEADERS = {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	};

	if (!interceptorsSetup && typeof window !== 'undefined') {
		axios.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				if (!config.url) return config as InternalAxiosRequestConfig;

				const u = config.url;
				const base = env.apiUrl.replace(/\/$/, '');
				const targetsApiHost =
					u.startsWith('/api/') ||
					u === '/api' ||
					u.startsWith('/hubs/') ||
					u === '/hubs' ||
					u.startsWith(`${base}/api/`) ||
					u.startsWith(`${base}/api?`) ||
					u === `${base}/api` ||
					u.startsWith(`${base}/hubs/`) ||
					u.startsWith(`${base}/hubs?`) ||
					u === `${base}/hubs`;

				if (!targetsApiHost) {
					return config as InternalAxiosRequestConfig;
				}

				config.url = applyFacePrefixToRequestUrl(u, env.defaultFacePrefix, env.apiUrl);
				return config as InternalAxiosRequestConfig;
			},
			(error: AxiosError) => Promise.reject(error)
		);
		interceptorsSetup = true;
	}

	if (env.debugMode) {
		console.log(`API client configured with base URL: ${env.apiUrl}`);
	}
}

/**
 * Set authentication token for API requests
 * The token is automatically added to Authorization header by request.ts
 */
export function setAuthToken(token: string | null) {
	if (token) {
		OpenAPI.TOKEN = token;
		// Remove Authorization from HEADERS if it exists (request.ts will add it from TOKEN)
		const currentHeaders = typeof OpenAPI.HEADERS === 'function' ? {} : OpenAPI.HEADERS || {};
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { Authorization, ...headers } = currentHeaders;
		OpenAPI.HEADERS =
			Object.keys(headers).length > 0
				? headers
				: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					};
	} else {
		OpenAPI.TOKEN = undefined;
		// Remove Authorization header if it exists
		const currentHeaders = typeof OpenAPI.HEADERS === 'function' ? {} : OpenAPI.HEADERS || {};
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { Authorization, ...headers } = currentHeaders;
		OpenAPI.HEADERS =
			Object.keys(headers).length > 0
				? headers
				: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					};
	}
}
