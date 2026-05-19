import { describe, expect, it } from 'vitest';
import {
	ADMIN_TABLE_PAGE_SIZE,
	isWallTicketRowSelected,
	wallTicketApiPageToTablePageIndex,
	wallTicketTablePageIndexToApiPage,
} from '../adminTableUtils';

describe('ADMIN_TABLE_PAGE_SIZE', () => {
	it('is 10 for all admin grids', () => {
		expect(ADMIN_TABLE_PAGE_SIZE).toBe(10);
	});
});

describe('wall ticket pagination index mapping', () => {
	it('converts API page 1 to table pageIndex 0', () => {
		expect(wallTicketApiPageToTablePageIndex(1)).toBe(0);
		expect(wallTicketTablePageIndexToApiPage(0)).toBe(1);
	});

	it('clamps invalid API pages to index 0', () => {
		expect(wallTicketApiPageToTablePageIndex(0)).toBe(0);
		expect(wallTicketApiPageToTablePageIndex(-3)).toBe(0);
	});

	it('clamps invalid table indices to API page 1', () => {
		expect(wallTicketTablePageIndexToApiPage(-1)).toBe(1);
	});
});

describe('isWallTicketRowSelected', () => {
	it('matches when selected id equals row id', () => {
		expect(isWallTicketRowSelected(5, 5)).toBe(true);
	});

	it('is false when selection is cleared or different', () => {
		expect(isWallTicketRowSelected(null, 5)).toBe(false);
		expect(isWallTicketRowSelected(undefined, 5)).toBe(false);
		expect(isWallTicketRowSelected(4, 5)).toBe(false);
	});
});
