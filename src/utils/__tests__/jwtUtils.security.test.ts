import { describe, expect, it } from 'vitest';
import { isTokenExpired } from '../jwtUtils';

function jwt(payload: Record<string, unknown>): string {
	const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
	const body = btoa(JSON.stringify(payload));
	return `${header}.${body}.sig`;
}

describe('jwtUtils session edge cases (ASH1-T-A12, A13)', () => {
	it('ASH1-T-A13: malformed JWT treated as expired', () => {
		expect(isTokenExpired('not-a-jwt')).toBe(true);
	});

	it('ASH1-T-A12: expired JWT detected via exp', () => {
		const expired = jwt({ exp: Math.floor(Date.now() / 1000) - 60 });
		expect(isTokenExpired(expired)).toBe(true);
		const valid = jwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
		expect(isTokenExpired(valid)).toBe(false);
	});
});
