import { describe, it, expect } from 'vitest';
import { isPendingInviteStatus, registrationInvitesKeys } from '../useRegistrationInvitesAdminApi';

describe('useRegistrationInvitesAdminApi', () => {
	it('registrationInvitesKeys.list uses page params', () => {
		expect(registrationInvitesKeys.list({ page: 1, pageSize: 10 })).toEqual([
			'registrationInvites',
			'list',
			{ page: 1, pageSize: 10 },
		]);
	});

	it('isPendingInviteStatus is case-insensitive', () => {
		expect(isPendingInviteStatus('pending')).toBe(true);
		expect(isPendingInviteStatus('Pending')).toBe(true);
		expect(isPendingInviteStatus('completed')).toBe(false);
	});
});
