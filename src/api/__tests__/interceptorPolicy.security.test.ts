import { describe, expect, it } from 'vitest';
import {
	isAdminScopedApiRequest,
	isOAuthTokenEndpoint,
	isRateLimitResponse,
	shouldForceLogoutOn403,
	shouldHandle401Refresh,
} from '../interceptorPolicy';

const API_BASE = 'https://api.example.com';

describe('interceptorPolicy (ASH1-T-A08…A10)', () => {
	it('ASH1-T-A08: 403 on /admin/api/users → forced logout', () => {
		expect(
			shouldForceLogoutOn403(403, { url: '/admin/api/users' }, API_BASE)
		).toBe(true);
	});

	it('ASH1-T-A09: 403 on /api/oauth2/token → no forced logout', () => {
		expect(
			shouldForceLogoutOn403(403, { url: '/api/oauth2/token' }, API_BASE)
		).toBe(false);
	});

	it('ASH1-T-A09b: 403 outside env.apiUrl host → no logout', () => {
		expect(
			shouldForceLogoutOn403(
				403,
				{ url: 'https://evil.example/other' },
				API_BASE
			)
		).toBe(false);
	});

	it('ASH1-T-A10: 429 / rate_limit detected', () => {
		expect(isRateLimitResponse(429, null)).toBe(true);
		expect(isRateLimitResponse(400, { error: 'rate_limit' })).toBe(true);
		expect(isRateLimitResponse(401, null)).toBe(false);
	});

	it('ASH1-T-A05: 401 eligible for refresh once', () => {
		expect(shouldHandle401Refresh(401, { url: '/admin/api/users' })).toBe(true);
		expect(shouldHandle401Refresh(401, { url: '/admin/api/users', _retry: true })).toBe(false);
	});

	it('oauth token endpoint excluded from admin scope', () => {
		expect(isOAuthTokenEndpoint('/api/oauth2/token')).toBe(true);
		expect(isAdminScopedApiRequest({ url: '/api/oauth2/token' }, API_BASE)).toBe(false);
		expect(isAdminScopedApiRequest({ url: '/admin/api/users' }, API_BASE)).toBe(true);
	});
});
