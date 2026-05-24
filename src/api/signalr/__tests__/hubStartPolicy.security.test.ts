import { describe, expect, it } from 'vitest';
import { shouldConnectAiChatHub, shouldConnectMessengerHub } from '../hubStartPolicy';

function jwt(payload: Record<string, unknown>): string {
	const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
	const body = btoa(JSON.stringify(payload));
	return `${header}.${body}.sig`;
}

describe('hubStartPolicy (ASH1-T-C02…C04)', () => {
	it('ASH1-T-C02: hub start skipped when !token', () => {
		expect(
			shouldConnectAiChatHub({
				loading: false,
				aiEnabled: true,
				isAuthenticated: true,
				token: null,
			})
		).toBe(false);
	});

	it('ASH1-T-C03: hub start skipped when AI globally off', () => {
		expect(
			shouldConnectAiChatHub({
				loading: false,
				aiEnabled: false,
				isAuthenticated: true,
				token: 't',
			})
		).toBe(false);
	});

	it('ASH1-T-C04: messenger hub skipped without super-admin', () => {
		const adminToken = jwt({ role: 'ADMIN' });
		expect(
			shouldConnectMessengerHub({ isAuthenticated: true, token: adminToken })
		).toBe(false);
		const superToken = jwt({ role: 'SUPER_ADMIN' });
		expect(
			shouldConnectMessengerHub({ isAuthenticated: true, token: superToken })
		).toBe(true);
	});
});
