import { describe, expect, it, vi, beforeEach } from 'vitest';
import { assertAdminAppAccessAllowed } from '../adminAppAccess';
import * as meCapabilitiesClient from '../../api/meCapabilitiesClient';

function jwt(payload: Record<string, unknown>): string {
	const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
	const body = btoa(JSON.stringify(payload));
	return `${header}.${body}.sig`;
}

describe('adminAppAccess security (ASH1-T-A02…A04)', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('ASH1-T-A02: non-SUPER_ADMIN JWT rejected', async () => {
		const fetchSpy = vi.spyOn(meCapabilitiesClient, 'fetchMeCapabilities');
		await expect(assertAdminAppAccessAllowed(jwt({ role: 'ADMIN' }))).resolves.toBe(false);
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('ASH1-T-A03: SUPER_ADMIN without platform:super rejected', async () => {
		vi.spyOn(meCapabilitiesClient, 'fetchMeCapabilities').mockResolvedValue({
			globalRole: 'SUPER_ADMIN',
			requestFaceId: 1,
			requestFaceIndex: 'admin',
			isAdminFaceScope: true,
			myFaceRoleName: null,
			permissions: ['tenant:session'],
		});
		await expect(assertAdminAppAccessAllowed(jwt({ role: 'SUPER_ADMIN' }))).resolves.toBe(false);
	});

	it('ASH1-T-A04: capabilities network error fail closed', async () => {
		vi.spyOn(meCapabilitiesClient, 'fetchMeCapabilities').mockRejectedValue(new Error('network'));
		await expect(assertAdminAppAccessAllowed(jwt({ role: 'SUPER_ADMIN' }))).resolves.toBe(false);
	});
});
