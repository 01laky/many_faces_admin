import { describe, expect, it } from 'vitest';
import { resolveSafeInternalRedirectPath } from '../safeRedirect';

const ORIGIN = 'https://admin.example.com';

describe('safeRedirect (ASH1-T-A16)', () => {
	it('accepts internal localized path', () => {
		expect(resolveSafeInternalRedirectPath('/en/dashboard', '/en/dashboard', ORIGIN)).toBe(
			'/en/dashboard'
		);
	});

	it('rejects external absolute URL', () => {
		expect(
			resolveSafeInternalRedirectPath('https://evil.example/phish', '/en/dashboard', ORIGIN)
		).toBe('/en/dashboard');
	});

	it('rejects login loop paths', () => {
		expect(resolveSafeInternalRedirectPath('/en/login', '/en/dashboard', ORIGIN)).toBe(
			'/en/dashboard'
		);
	});

	it('rejects javascript: payloads', () => {
		expect(resolveSafeInternalRedirectPath('javascript:alert(1)', '/en/dashboard', ORIGIN)).toBe(
			'/en/dashboard'
		);
	});
});
