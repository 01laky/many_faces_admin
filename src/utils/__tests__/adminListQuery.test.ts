import { describe, expect, it } from 'vitest';
import {
	apiSortToSortingState,
	buildListQueryString,
	clampPageIndex,
	getListValidationErrorBody,
	isListSortValidationError,
	parsePaginatedEnvelope,
	parseSortWhitelistError,
	parseValidationProblemDetails,
	sortingStateToApi,
} from '../adminListQuery';

describe('adminListQuery', () => {
	it('sortingStateToApi maps first column', () => {
		expect(sortingStateToApi([{ id: 'email', desc: true }])).toEqual({
			sortBy: 'email',
			sortDir: 'desc',
		});
		expect(sortingStateToApi([])).toEqual({});
	});

	it('apiSortToSortingState hydrates sort', () => {
		expect(apiSortToSortingState('createdAt', 'desc')).toEqual([{ id: 'createdAt', desc: true }]);
	});

	it('clampPageIndex respects totalPages', () => {
		expect(clampPageIndex(4, 2)).toBe(1);
		expect(clampPageIndex(0, 3)).toBe(0);
	});

	it('buildListQueryString omits empty values', () => {
		expect(buildListQueryString({ page: 1, search: undefined, sortBy: 'email' })).toBe(
			'?page=1&sortBy=email'
		);
	});

	it('parsePaginatedEnvelope reads items envelope', () => {
		const parsed = parsePaginatedEnvelope<{ id: number }>(
			{ items: [{ id: 1 }], page: 2, pageSize: 10, totalCount: 15, totalPages: 2 },
			1,
			10
		);
		expect(parsed.items).toHaveLength(1);
		expect(parsed.totalPages).toBe(2);
	});

	it('parseSortWhitelistError extracts first field error', () => {
		const msg = parseSortWhitelistError({
			errors: { sortBy: ['sortBy is not allowed for this endpoint.'] },
		});
		expect(msg).toContain('sortBy');
	});

	it('isListSortValidationError detects ApiError-shaped 400', () => {
		expect(
			isListSortValidationError({
				status: 400,
				body: { errors: { sortBy: ['invalid'] } },
			})
		).toBe(true);
		expect(isListSortValidationError({ status: 500, body: {} })).toBe(false);
	});

	it('getListValidationErrorBody returns nested body', () => {
		const body = { errors: { page: ['bad'] } };
		expect(getListValidationErrorBody({ status: 400, body })).toEqual(body);
	});

	it('parseValidationProblemDetails returns null without errors', () => {
		expect(parseValidationProblemDetails({ title: 'Bad Request' })).toBeNull();
	});

	it('buildListQueryString encodes sort params', () => {
		expect(buildListQueryString({ page: 2, sortBy: 'email', sortDir: 'desc' })).toBe(
			'?page=2&sortBy=email&sortDir=desc'
		);
	});
});
