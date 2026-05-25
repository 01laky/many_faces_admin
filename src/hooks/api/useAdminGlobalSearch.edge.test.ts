// @vitest-environment happy-dom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
	applyAdminSearchResponse,
	mergeAdminSearchHits,
	shouldFetchAdminSearch,
	useAdminGlobalSearch,
} from './useAdminGlobalSearch';
import {
	ADMIN_SEARCH_DEBOUNCE_MS,
	ADMIN_SEARCH_PAGE_SIZE,
} from '@/constants/adminGlobalSearchConstants';

const mockGetAdminSearchAutocomplete = vi.fn();

vi.mock('@/api/services/adminSearchApi', () => ({
	getAdminSearchAutocomplete: (...args: unknown[]) => mockGetAdminSearchAutocomplete(...args),
}));

describe('useAdminGlobalSearch helpers', () => {
	it('shouldFetchAdminSearch respects min length', () => {
		expect(shouldFetchAdminSearch('a')).toBe(false);
		expect(shouldFetchAdminSearch('ab')).toBe(true);
	});

	it('mergeAdminSearchHits replace vs append', () => {
		const a = [{ entityType: 'user', entityId: '1', title: 'A' }];
		const b = [{ entityType: 'user', entityId: '2', title: 'B' }];
		expect(mergeAdminSearchHits(a, b, 'replace')).toEqual(b);
		expect(mergeAdminSearchHits(a, b, 'append')).toEqual([...a, ...b]);
	});

	it('applyAdminSearchResponse maps pagination fields', () => {
		const result = applyAdminSearchResponse(
			[],
			{
				query: 'demo',
				offset: 0,
				pageSize: ADMIN_SEARCH_PAGE_SIZE,
				hits: [{ entityType: 'user', entityId: '1', title: 'demo@x.com' }],
				hasMore: true,
				nextOffset: 100,
				searchAvailable: true,
			},
			'replace'
		);
		expect(result.hasMore).toBe(true);
		expect(result.nextOffset).toBe(100);
		expect(result.hits).toHaveLength(1);
	});
});

describe('useAdminGlobalSearch hook (GSH1-T-U03, GSH1-T-U04, GSH1-T-U12…U14)', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		mockGetAdminSearchAutocomplete.mockReset();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	async function flushDebounceAndMicrotasks() {
		await act(async () => {
			await vi.advanceTimersByTimeAsync(ADMIN_SEARCH_DEBOUNCE_MS);
		});
	}

	it('GSH1-T-U03: debounce 300ms — single fetch after typing burst', async () => {
		mockGetAdminSearchAutocomplete.mockResolvedValue({
			query: 'demo',
			offset: 0,
			pageSize: ADMIN_SEARCH_PAGE_SIZE,
			hits: [],
			hasMore: false,
			nextOffset: 0,
			searchAvailable: true,
		});

		const { result } = renderHook(() => useAdminGlobalSearch({ token: 'tok' }));

		act(() => {
			result.current.setQuery('d');
			result.current.setQuery('de');
			result.current.setQuery('demo');
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(ADMIN_SEARCH_DEBOUNCE_MS - 1);
		});
		expect(mockGetAdminSearchAutocomplete).not.toHaveBeenCalled();

		await flushDebounceAndMicrotasks();

		expect(mockGetAdminSearchAutocomplete).toHaveBeenCalledTimes(1);
		expect(mockGetAdminSearchAutocomplete).toHaveBeenCalledWith(
			'tok',
			{ q: 'demo', offset: 0, pageSize: ADMIN_SEARCH_PAGE_SIZE },
			expect.any(AbortSignal)
		);
	});

	it('GSH1-T-U04: AbortSignal passed and prior request aborted on new keystroke', async () => {
		let firstSignal: AbortSignal | undefined;
		let resolveFirst: ((value: unknown) => void) | undefined;

		mockGetAdminSearchAutocomplete.mockImplementationOnce(
			(_token: string, _params: unknown, signal?: AbortSignal) => {
				firstSignal = signal;
				return new Promise((resolve) => {
					resolveFirst = resolve;
				});
			}
		);

		const { result } = renderHook(() => useAdminGlobalSearch({ token: 'tok' }));

		act(() => {
			result.current.setQuery('dem');
		});
		await flushDebounceAndMicrotasks();
		expect(mockGetAdminSearchAutocomplete).toHaveBeenCalledTimes(1);

		mockGetAdminSearchAutocomplete.mockResolvedValueOnce({
			query: 'demo',
			offset: 0,
			pageSize: ADMIN_SEARCH_PAGE_SIZE,
			hits: [],
			hasMore: false,
			nextOffset: 0,
			searchAvailable: true,
		});

		act(() => {
			result.current.setQuery('demo');
		});
		await flushDebounceAndMicrotasks();

		expect(firstSignal?.aborted).toBe(true);
		expect(mockGetAdminSearchAutocomplete).toHaveBeenCalledTimes(2);
		resolveFirst?.({
			query: 'dem',
			offset: 0,
			pageSize: ADMIN_SEARCH_PAGE_SIZE,
			hits: [],
			hasMore: false,
			nextOffset: 0,
			searchAvailable: true,
		});
	});

	it('GSH1-T-U12: load-more uses nextOffset and appends hits', async () => {
		mockGetAdminSearchAutocomplete
			.mockResolvedValueOnce({
				query: 'demo',
				offset: 0,
				pageSize: ADMIN_SEARCH_PAGE_SIZE,
				hits: [{ entityType: 'user', entityId: '1', title: 'A' }],
				hasMore: true,
				nextOffset: 100,
				searchAvailable: true,
			})
			.mockResolvedValueOnce({
				query: 'demo',
				offset: 100,
				pageSize: ADMIN_SEARCH_PAGE_SIZE,
				hits: [{ entityType: 'user', entityId: '2', title: 'B' }],
				hasMore: false,
				nextOffset: 200,
				searchAvailable: true,
			});

		const { result } = renderHook(() => useAdminGlobalSearch({ token: 'tok' }));

		act(() => {
			result.current.setQuery('demo');
		});
		await flushDebounceAndMicrotasks();

		expect(result.current.hits).toHaveLength(1);
		expect(result.current.hasMore).toBe(true);

		await act(async () => {
			result.current.loadMore();
			await Promise.resolve();
		});

		expect(result.current.hits).toHaveLength(2);
		expect(mockGetAdminSearchAutocomplete).toHaveBeenLastCalledWith(
			'tok',
			{ q: 'demo', offset: 100, pageSize: ADMIN_SEARCH_PAGE_SIZE },
			expect.any(AbortSignal)
		);
	});

	it('GSH1-T-U14: hasMore=false does not fetch on loadMore', async () => {
		mockGetAdminSearchAutocomplete.mockResolvedValue({
			query: 'demo',
			offset: 0,
			pageSize: ADMIN_SEARCH_PAGE_SIZE,
			hits: [{ entityType: 'user', entityId: '1', title: 'A' }],
			hasMore: false,
			nextOffset: 100,
			searchAvailable: true,
		});

		const { result } = renderHook(() => useAdminGlobalSearch({ token: 'tok' }));

		act(() => {
			result.current.setQuery('demo');
		});
		await flushDebounceAndMicrotasks();

		expect(result.current.hasMore).toBe(false);

		act(() => {
			result.current.loadMore();
		});

		expect(mockGetAdminSearchAutocomplete).toHaveBeenCalledTimes(1);
	});
});
