import { describe, it, expect } from 'vitest';
import { isSuperAdminFromToken } from '../platformAccess';

function makeJwt(payloadObj: Record<string, unknown>): string {
	const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
	const payload = btoa(JSON.stringify(payloadObj));
	return `${header}.${payload}.sig`;
}

/** Real JWTs encode the payload as base64url (`-`/`_`, no `=` padding). */
function makeJwtBase64Url(payloadObj: Record<string, unknown>): string {
	const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
	const payload = btoa(JSON.stringify(payloadObj))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
	return `${header}.${payload}.sig`;
}

describe('isSuperAdminFromToken', () => {
	it('returns false for null/undefined/empty token', () => {
		expect(isSuperAdminFromToken(null)).toBe(false);
		expect(isSuperAdminFromToken(undefined)).toBe(false);
		expect(isSuperAdminFromToken('')).toBe(false);
	});

	it('returns true for a single-string SUPER_ADMIN role claim', () => {
		expect(isSuperAdminFromToken(makeJwt({ role: 'SUPER_ADMIN' }))).toBe(true);
	});

	it('returns true when SUPER_ADMIN is in a roles array', () => {
		expect(isSuperAdminFromToken(makeJwt({ roles: ['USER', 'SUPER_ADMIN'] }))).toBe(true);
	});

	it('reads the schemas.microsoft.com role claim', () => {
		const claim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
		expect(isSuperAdminFromToken(makeJwt({ [claim]: 'SUPER_ADMIN' }))).toBe(true);
	});

	it('returns false for non-super roles (e.g. portal ADMIN)', () => {
		expect(isSuperAdminFromToken(makeJwt({ role: 'ADMIN' }))).toBe(false);
		expect(isSuperAdminFromToken(makeJwt({ role: 'USER' }))).toBe(false);
	});

	it('returns false for malformed tokens', () => {
		expect(isSuperAdminFromToken('not-a-jwt')).toBe(false);
		expect(isSuperAdminFromToken('only.two')).toBe(false);
	});

	it('recognises SUPER_ADMIN in a base64url payload (regression: raw atob threw on - / _)', () => {
		// `>>>` / `???` force `+` / `/` in standard base64 → `-` / `_` in base64url.
		const jwt = makeJwtBase64Url({ role: 'SUPER_ADMIN', pad: 'a>>>b???c' });
		expect(jwt.split('.')[1]).toMatch(/[-_]/); // guard: truly exercises the base64url path
		expect(isSuperAdminFromToken(jwt)).toBe(true);
	});
});
