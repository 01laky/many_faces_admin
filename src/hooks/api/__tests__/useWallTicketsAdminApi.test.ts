import { describe, it, expect } from 'vitest';
import { isWallTicketsForbiddenError, wallTicketsKeys } from '../useWallTicketsAdminApi';

describe('useWallTicketsAdminApi', () => {
	it('wallTicketsKeys.list includes face and pagination', () => {
		expect(wallTicketsKeys.list(5, { page: 2, pageSize: 20, status: 'active' })).toEqual([
			'wallTickets',
			'list',
			5,
			{ page: 2, pageSize: 20, status: 'active' },
		]);
	});

	it('isWallTicketsForbiddenError detects 403 messages', () => {
		expect(isWallTicketsForbiddenError(new Error('403 Forbidden'))).toBe(true);
		expect(isWallTicketsForbiddenError(new Error('access forbidden'))).toBe(true);
		expect(isWallTicketsForbiddenError(new Error('network error'))).toBe(false);
	});
});
