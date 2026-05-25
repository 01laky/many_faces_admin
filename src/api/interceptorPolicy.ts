import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

/** Pure policy helpers for axios interceptors (ASH1-A2 — unit tested). */

export function isOAuthTokenEndpoint(url: string | undefined): boolean {
	return Boolean(url?.includes('/oauth2/token'));
}

export function isAdminScopedApiRequest(
	config: AxiosRequestConfig | InternalAxiosRequestConfig,
	apiBaseUrl: string
): boolean {
	const rawUrl = config.url ?? '';
	if (isOAuthTokenEndpoint(rawUrl)) return false;

	const base = apiBaseUrl.replace(/\/+$/, '');
	const absolute = rawUrl.startsWith('http')
		? rawUrl
		: `${base}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
	return absolute.startsWith(base);
}

export function shouldForceLogoutOn403(
	status: number | undefined,
	config: AxiosRequestConfig | InternalAxiosRequestConfig,
	apiBaseUrl: string
): boolean {
	return status === 403 && isAdminScopedApiRequest(config, apiBaseUrl);
}

export function shouldHandle401Refresh(
	status: number | undefined,
	config: AxiosRequestConfig & { _retry?: boolean }
): boolean {
	if (status !== 401) return false;
	if (config._retry) return false;
	if (isOAuthTokenEndpoint(config.url)) return false;
	return true;
}

export function isRateLimitResponse(status: number | undefined, body: unknown): boolean {
	if (status === 429) return true;
	if (body && typeof body === 'object' && 'error' in body) {
		return (body as { error?: string }).error === 'rate_limit';
	}
	return false;
}
