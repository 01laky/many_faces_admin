import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	adminListWallTickets,
	adminApproveWallTicket,
	adminCreateWallTicket,
	adminPostWallTicketComment,
	adminDenyWallTicket,
	adminDeleteWallTicket,
	adminGetWallTicket,
	adminDeleteWallTicketComment,
} from '../wallTicketsAdminApi';

vi.mock('../../faceApiRouting', () => ({
	absoluteScopedUrl: (path: string) => `https://api.test/admin${path}`,
}));

const fetchMock = vi.fn();

describe('wallTicketsAdminApi', () => {
	beforeEach(() => {
		fetchMock.mockReset();
		vi.stubGlobal('fetch', fetchMock);
	});

	it('lists wall tickets with bearer token and pagination', async () => {
		const payload = {
			items: [],
			page: 2,
			pageSize: 10,
			totalCount: 0,
			totalPages: 0,
		};
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: async () => payload,
		});

		const result = await adminListWallTickets('tok', 5, { page: 2, pageSize: 10 });

		expect(result).toBe(payload);
		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.test/admin/api/admin/faces/5/wall-tickets?page=2&pageSize=10',
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: 'Bearer tok',
				}),
			})
		);
	});

	it('throws parsed API error when list fails', async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			text: async () => JSON.stringify({ error: 'Forbidden' }),
		});

		await expect(adminListWallTickets('tok', 1)).rejects.toThrow('Forbidden');
	});

	it('lists with status filter query', async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				items: [],
				page: 1,
				pageSize: 20,
				totalCount: 0,
				totalPages: 0,
			}),
		});

		await adminListWallTickets('tok', 5, { page: 1, pageSize: 20, status: 'active' });

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('status=active'),
			expect.any(Object)
		);
	});

	it('POSTs create with JSON body', async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ id: 1, title: 'T', status: 'active', createdAt: '2026-01-01' }),
		});

		await adminCreateWallTicket('tok', 2, { title: 'T', description: 'D' });

		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.test/admin/api/admin/faces/2/wall-tickets',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ title: 'T', description: 'D' }),
			})
		);
	});

	it('POSTs staff comment', async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				id: 9,
				content: 'hi',
				userId: 'u',
				authorName: 'A',
				createdAt: '2026-01-01',
			}),
		});

		await adminPostWallTicketComment('tok', 2, 10, 'hi');

		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.test/admin/api/admin/faces/2/wall-tickets/10/comments',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ content: 'hi' }),
			})
		);
	});

	it('POSTs approve endpoint', async () => {
		fetchMock.mockResolvedValueOnce({ ok: true, text: async () => '' });

		await adminApproveWallTicket('tok', 3, 99);

		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.test/admin/api/admin/faces/3/wall-tickets/99/approve',
			expect.objectContaining({ method: 'POST' })
		);
	});

	it('POSTs deny endpoint', async () => {
		fetchMock.mockResolvedValueOnce({ ok: true, text: async () => '' });

		await adminDenyWallTicket('tok', 4, 11);

		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.test/admin/api/admin/faces/4/wall-tickets/11/deny',
			expect.objectContaining({ method: 'POST' })
		);
	});

	it('DELETEs ticket', async () => {
		fetchMock.mockResolvedValueOnce({ ok: true, text: async () => '' });

		await adminDeleteWallTicket('tok', 4, 11);

		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.test/admin/api/admin/faces/4/wall-tickets/11',
			expect.objectContaining({ method: 'DELETE' })
		);
	});

	it('GETs ticket detail', async () => {
		const detail = { id: 11, title: 'T', status: 'active' };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: async () => detail,
		});

		const result = await adminGetWallTicket('tok', 4, 11);

		expect(result).toBe(detail);
		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.test/admin/api/admin/faces/4/wall-tickets/11',
			expect.objectContaining({
				headers: expect.objectContaining({ Authorization: 'Bearer tok' }),
			})
		);
	});

	it('DELETEs comment', async () => {
		fetchMock.mockResolvedValueOnce({ ok: true, text: async () => '' });

		await adminDeleteWallTicketComment('tok', 4, 11, 55);

		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.test/admin/api/admin/faces/4/wall-tickets/11/comments/55',
			expect.objectContaining({ method: 'DELETE' })
		);
	});
});
