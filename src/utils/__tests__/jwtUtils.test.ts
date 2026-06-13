import { describe, it, expect, vi, afterEach } from 'vitest';
import { isTokenExpired, decodeJwtPayload } from '../jwtUtils';

function makeJwt(payloadObj: Record<string, unknown>): string {
	const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
	const payload = btoa(JSON.stringify(payloadObj));
	return `${header}.${payload}.x`;
}

/** Real JWTs encode the payload as base64url (`-`/`_`, no `=` padding) — what a raw atob() chokes on. */
function makeJwtBase64Url(payloadObj: Record<string, unknown>): string {
	const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
	const payload = btoa(JSON.stringify(payloadObj))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
	return `${header}.${payload}.x`;
}

describe('isTokenExpired', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns false when exp is missing', () => {
		expect(isTokenExpired(makeJwt({ sub: 'u1' }))).toBe(false);
	});

	it('returns false when exp is in the future', () => {
		const future = Math.floor(Date.now() / 1000) + 3600;
		expect(isTokenExpired(makeJwt({ exp: future }))).toBe(false);
	});

	it('returns true when exp is in the past', () => {
		const past = Math.floor(Date.now() / 1000) - 60;
		expect(isTokenExpired(makeJwt({ exp: past }))).toBe(true);
	});

	it('returns true when exp matches current second (RFC 7519: not before exp)', () => {
		vi.useFakeTimers();
		const nowSec = 1_700_000_000;
		vi.setSystemTime(nowSec * 1000);
		expect(isTokenExpired(makeJwt({ exp: nowSec }))).toBe(true);
	});

	it('returns true when exp is strictly before now', () => {
		vi.useFakeTimers();
		const nowSec = 1_700_000_000;
		vi.setSystemTime(nowSec * 1000);
		expect(isTokenExpired(makeJwt({ exp: nowSec - 1 }))).toBe(true);
	});

	it('returns true for malformed JWT strings', () => {
		expect(isTokenExpired('')).toBe(true);
		expect(isTokenExpired('not-a-jwt')).toBe(true);
		expect(isTokenExpired('only.two')).toBe(true);
	});

	it('decodes a base64url-encoded payload (regression: raw atob threw on - / _)', () => {
		const future = Math.floor(Date.now() / 1000) + 3600;
		// `>>>` / `???` force `+` / `/` in standard base64 → `-` / `_` in base64url.
		const jwt = makeJwtBase64Url({ exp: future, sub: 'a>>>b???c' });
		const payloadSegment = jwt.split('.')[1];
		expect(payloadSegment).toMatch(/[-_]/); // guard: this token truly exercises the base64url path
		expect(isTokenExpired(jwt)).toBe(false);
	});
});

describe('decodeJwtPayload', () => {
	it('returns the parsed payload for a base64url token', () => {
		const jwt = makeJwtBase64Url({ sub: 'a>>>b???c', role: 'SUPER_ADMIN' });
		expect(decodeJwtPayload(jwt)).toMatchObject({ sub: 'a>>>b???c', role: 'SUPER_ADMIN' });
	});

	it('returns null for empty/malformed tokens', () => {
		expect(decodeJwtPayload(null)).toBeNull();
		expect(decodeJwtPayload(undefined)).toBeNull();
		expect(decodeJwtPayload('only.one')).toBeNull();
		expect(decodeJwtPayload('a..c')).toBeNull();
	});
});
