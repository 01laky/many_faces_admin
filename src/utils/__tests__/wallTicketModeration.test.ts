import { describe, expect, it } from 'vitest';
import {
	parseWallTicketIdFromSearch,
	statusFilterToQuery,
	wallTicketActionsForStatus,
	wallTicketDetailSearchParams,
} from '../wallTicketModeration';

describe('wallTicketActionsForStatus', () => {
	it('allows approve/deny/comment only when active', () => {
		expect(wallTicketActionsForStatus('active')).toMatchObject({
			canApprove: true,
			canDeny: true,
			canAddComment: true,
		});
		expect(wallTicketActionsForStatus('approved')).toMatchObject({
			canApprove: false,
			canDeny: false,
			canAddComment: false,
			canDeleteTicket: true,
		});
	});

	it('treats unknown status as non-active for moderation', () => {
		expect(wallTicketActionsForStatus('UNKNOWN').canApprove).toBe(false);
	});
});

describe('statusFilterToQuery', () => {
	it('omits query when filter is all', () => {
		expect(statusFilterToQuery('')).toBeUndefined();
	});
	it('passes status value', () => {
		expect(statusFilterToQuery('denied')).toBe('denied');
	});
});

describe('parseWallTicketIdFromSearch', () => {
	it('returns positive ids', () => {
		expect(parseWallTicketIdFromSearch('42')).toBe(42);
	});
	it('rejects empty, zero, and non-numeric', () => {
		expect(parseWallTicketIdFromSearch(null)).toBeNull();
		expect(parseWallTicketIdFromSearch('')).toBeNull();
		expect(parseWallTicketIdFromSearch('0')).toBeNull();
		expect(parseWallTicketIdFromSearch('abc')).toBeNull();
	});
});

describe('wallTicketDetailSearchParams', () => {
	it('stringifies ticket id for the query string', () => {
		expect(wallTicketDetailSearchParams(7)).toEqual({ ticketId: '7' });
	});
});
