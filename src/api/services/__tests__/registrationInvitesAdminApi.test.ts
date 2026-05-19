import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	createRegistrationInvite,
	listRegistrationInvites,
	resendRegistrationInviteEmail,
	revokeRegistrationInvite,
} from '../registrationInvitesAdminApi';

vi.mock('../../faceApiRouting', () => ({
	absoluteScopedUrl: (path: string) => `https://api.test/admin${path}`,
}));

const fetchMock = vi.fn();

describe('registrationInvitesAdminApi', () => {
	beforeEach(() => {
		fetchMock.mockReset();
		vi.stubGlobal('fetch', fetchMock);
	});

	it('lists invites with pagination query', async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: async () => [],
		});

		await listRegistrationInvites('tok', { page: 2, pageSize: 25 });

		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.test/admin/api/admin/registration-invites?page=2&pageSize=25',
			expect.objectContaining({
				headers: expect.objectContaining({ Authorization: 'Bearer tok' }),
			})
		);
	});

	it('POSTs create invite body', async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				id: '1',
				email: 'a@b.c',
				status: 'pending',
				createdAtUtc: '',
				expiresAtUtc: '',
				consumedAtUtc: null,
			}),
		});

		await createRegistrationInvite('tok', {
			email: 'a@b.c',
			firstName: 'A',
			locale: 'sk',
		});

		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.test/admin/api/admin/registration-invites',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ email: 'a@b.c', firstName: 'A', locale: 'sk' }),
			})
		);
	});

	it('POSTs resend on public register path', async () => {
		fetchMock.mockResolvedValueOnce({ ok: true });

		await resendRegistrationInviteEmail('tok', 'a@b.c');

		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.test/admin/api/auth/register/resend',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ email: 'a@b.c' }),
			})
		);
	});

	it('POSTs revoke by id', async () => {
		fetchMock.mockResolvedValueOnce({ ok: true });

		await revokeRegistrationInvite('tok', 'invite-99');

		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.test/admin/api/admin/registration-invites/invite-99/revoke',
			expect.objectContaining({ method: 'POST' })
		);
	});

	it('throws parsed API error when list fails', async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			text: async () => JSON.stringify({ error: 'Forbidden' }),
		});

		await expect(listRegistrationInvites('tok')).rejects.toThrow('Forbidden');
	});
});
