import { describe, expect, it, vi, beforeEach } from 'vitest';
import { isSuperAdminFromToken } from '../platformAccess';
import { assertAdminAppAccessAllowed, forcePlatformAccessDeniedLogout } from '../adminAppAccess';
import * as meCapabilitiesClient from '../../api/meCapabilitiesClient';

function jwt(payload: Record<string, unknown>): string {
	const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
	const body = btoa(JSON.stringify(payload));
	return `${header}.${body}.sig`;
}

describe('isSuperAdminFromToken (ACC-U1…U3)', () => {
	it('ACC-U1: SUPER_ADMIN → true', () => {
		expect(isSuperAdminFromToken(jwt({ role: 'SUPER_ADMIN' }))).toBe(true);
	});

	it('ACC-U2: ADMIN → false', () => {
		expect(isSuperAdminFromToken(jwt({ role: 'ADMIN' }))).toBe(false);
	});

	it('ACC-U3: roles array with ADMIN and USER → false', () => {
		expect(isSuperAdminFromToken(jwt({ roles: ['ADMIN', 'USER'] }))).toBe(false);
	});
});

describe('assertAdminAppAccessAllowed (ACC-U4…U5)', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('ACC-U4: caps without platform:super → false', async () => {
		vi.spyOn(meCapabilitiesClient, 'fetchMeCapabilities').mockResolvedValue({
			globalRole: 'SUPER_ADMIN',
			requestFaceId: 1,
			requestFaceIndex: 'admin',
			isAdminFaceScope: true,
			myFaceRoleName: null,
			permissions: ['tenant:session'],
		});
		const token = jwt({ role: 'SUPER_ADMIN' });
		await expect(assertAdminAppAccessAllowed(token)).resolves.toBe(false);
	});

	it('ACC-U5: caps with platform:super → true', async () => {
		vi.spyOn(meCapabilitiesClient, 'fetchMeCapabilities').mockResolvedValue({
			globalRole: 'SUPER_ADMIN',
			requestFaceId: 1,
			requestFaceIndex: 'admin',
			isAdminFaceScope: true,
			myFaceRoleName: null,
			permissions: ['platform:super', 'platform:admin', 'tenant:session'],
		});
		const token = jwt({ role: 'SUPER_ADMIN' });
		await expect(assertAdminAppAccessAllowed(token)).resolves.toBe(true);
	});

	it('ACC-U7: ADMIN JWT fast-path → false without capabilities call', async () => {
		const fetchSpy = vi.spyOn(meCapabilitiesClient, 'fetchMeCapabilities');
		const token = jwt({ role: 'ADMIN' });
		await expect(assertAdminAppAccessAllowed(token)).resolves.toBe(false);
		expect(fetchSpy).not.toHaveBeenCalled();
	});
});

describe('forcePlatformAccessDeniedLogout (ACC-U6)', () => {
	it('ACC-U6: clears auth storage before redirect', () => {
		const store = new Map<string, string>();
		vi.stubGlobal('localStorage', {
			removeItem: (key: string) => {
				store.delete(key);
			},
			setItem: (key: string, value: string) => {
				store.set(key, value);
			},
			getItem: (key: string) => store.get(key) ?? null,
		});

		store.set('auth_token', 'x');
		store.set('auth_refresh_token', 'y');
		store.set('auth_user', '{}');

		vi.stubGlobal('window', {
			location: {
				href: 'http://localhost/en/login',
				pathname: '/en/login',
			},
		});

		forcePlatformAccessDeniedLogout('denied');

		expect(store.has('auth_token')).toBe(false);
		expect(store.has('auth_refresh_token')).toBe(false);
		expect(store.has('auth_user')).toBe(false);
	});
});
