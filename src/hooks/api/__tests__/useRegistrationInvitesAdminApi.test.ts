import { describe, it, expect } from 'vitest';
import { isPendingInviteStatus, registrationInvitesKeys } from '../useRegistrationInvitesAdminApi';

describe('useRegistrationInvitesAdminApi', () => {
	it('registrationInvitesKeys.list uses skip/take', () => {
		expect(registrationInvitesKeys.list(0, 50)).toEqual(['registrationInvites', 'list', 0, 50]);
	});

	it('isPendingInviteStatus is case-insensitive', () => {
		expect(isPendingInviteStatus('pending')).toBe(true);
		expect(isPendingInviteStatus('Pending')).toBe(true);
		expect(isPendingInviteStatus('completed')).toBe(false);
	});
});
