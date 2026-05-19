import { describe, it, expect } from 'vitest';
import { isWallTicketsForbiddenError, wallTicketsKeys } from '../useWallTicketsAdminApi';

describe('useWallTicketsAdminApi', () => {
	it('wallTicketsKeys.list includes face and pagination', () => {
		expect(wallTicketsKeys.list(5, 2, 20, 'active')).toEqual([
			'wallTickets',
			'list',
			5,
			2,
			20,
			'active',
		]);
	});

	it('isWallTicketsForbiddenError detects 403 messages', () => {
		expect(isWallTicketsForbiddenError(new Error('403 Forbidden'))).toBe(true);
		expect(isWallTicketsForbiddenError(new Error('access forbidden'))).toBe(true);
		expect(isWallTicketsForbiddenError(new Error('network error'))).toBe(false);
	});
});
