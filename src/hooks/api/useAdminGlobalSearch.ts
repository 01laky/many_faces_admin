import { useCallback, useEffect, useRef, useState } from 'react';
import type {
	AdminSearchHitDto,
	AdminSearchAutocompleteResponse,
} from '@/api/models/AdminSearchAutocompleteDto';
import { getAdminSearchAutocomplete } from '@/api/services/adminSearchApi';
import {
	ADMIN_SEARCH_DEBOUNCE_MS,
	ADMIN_SEARCH_MIN_QUERY_LENGTH,
	ADMIN_SEARCH_PAGE_SIZE,
	type AdminSearchEntityType,
} from '@/constants/adminGlobalSearchConstants';

export type AdminGlobalSearchStatus = 'idle' | 'loading' | 'loadingMore' | 'ready' | 'error';

export type UseAdminGlobalSearchResult = {
	query: string;
	setQuery: (value: string) => void;
	debouncedQuery: string;
	selectedTypes: AdminSearchEntityType[];
	setSelectedTypes: (types: AdminSearchEntityType[]) => void;
	toggleEntityType: (type: AdminSearchEntityType) => void;
	hits: AdminSearchHitDto[];
	hasMore: boolean;
	nextOffset: number;
	searchAvailable: boolean;
	message: string | null;
	status: AdminGlobalSearchStatus;
	loadMore: () => void;
	reset: () => void;
};

/** @internal Exported for unit tests. */
export function shouldFetchAdminSearch(
	query: string,
	minLength: number = ADMIN_SEARCH_MIN_QUERY_LENGTH
): boolean {
	return query.trim().length >= minLength;
}

/** @internal Exported for unit tests. */
export function mergeAdminSearchHits(
	prev: AdminSearchHitDto[],
	next: AdminSearchHitDto[],
	mode: 'replace' | 'append'
): AdminSearchHitDto[] {
	return mode === 'replace' ? next : [...prev, ...next];
}

/** @internal Exported for unit tests — applies API page to local pagination state. */
export function applyAdminSearchResponse(
	prevHits: AdminSearchHitDto[],
	response: AdminSearchAutocompleteResponse,
	mode: 'replace' | 'append'
): Pick<
	UseAdminGlobalSearchResult,
	'hits' | 'hasMore' | 'nextOffset' | 'searchAvailable' | 'message'
> {
	return {
		hits: mergeAdminSearchHits(prevHits, response.hits ?? [], mode),
		hasMore: response.hasMore === true,
		nextOffset: typeof response.nextOffset === 'number' ? response.nextOffset : 0,
		searchAvailable: response.searchAvailable !== false,
		message: response.message ?? null,
	};
}

type UseAdminGlobalSearchOptions = {
	token: string | null;
	enabled?: boolean;
};

export function useAdminGlobalSearch({
	token,
	enabled = true,
}: UseAdminGlobalSearchOptions): UseAdminGlobalSearchResult {
	const [query, setQueryState] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');
	const [selectedTypes, setSelectedTypes] = useState<AdminSearchEntityType[]>([]);
	const [hits, setHits] = useState<AdminSearchHitDto[]>([]);
	const [hasMore, setHasMore] = useState(false);
	const [nextOffset, setNextOffset] = useState(0);
	const [searchAvailable, setSearchAvailable] = useState(true);
	const [message, setMessage] = useState<string | null>(null);
	const [status, setStatus] = useState<AdminGlobalSearchStatus>('idle');

	const abortRef = useRef<AbortController | null>(null);
	const loadMoreInFlightRef = useRef(false);
	const debouncedQueryRef = useRef(debouncedQuery);

	useEffect(() => {
		debouncedQueryRef.current = debouncedQuery;
	}, [debouncedQuery]);

	const cancelInFlight = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		loadMoreInFlightRef.current = false;
	}, []);

	const reset = useCallback(() => {
		cancelInFlight();
		setQueryState('');
		setDebouncedQuery('');
		setSelectedTypes([]);
		setHits([]);
		setHasMore(false);
		setNextOffset(0);
		setSearchAvailable(true);
		setMessage(null);
		setStatus('idle');
	}, [cancelInFlight]);

	const setQuery = useCallback((value: string) => {
		setQueryState(value);
	}, []);

	const toggleEntityType = useCallback((type: AdminSearchEntityType) => {
		setSelectedTypes((prev) =>
			prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
		);
	}, []);

	useEffect(() => {
		const handle = window.setTimeout(() => {
			setDebouncedQuery(query.trim());
		}, ADMIN_SEARCH_DEBOUNCE_MS);
		return () => window.clearTimeout(handle);
	}, [query]);

	const fetchPage = useCallback(
		async (q: string, offset: number, mode: 'replace' | 'append') => {
			if (!token || !enabled) return;

			cancelInFlight();
			const controller = new AbortController();
			abortRef.current = controller;

			setStatus(mode === 'append' ? 'loadingMore' : 'loading');

			try {
				const response = await getAdminSearchAutocomplete(
					token,
					{
						q,
						offset,
						pageSize: ADMIN_SEARCH_PAGE_SIZE,
						types: selectedTypes.length > 0 ? [...selectedTypes] : undefined,
					},
					controller.signal
				);

				if (controller.signal.aborted) return;
				if (debouncedQueryRef.current !== q) return;

				setHits((prevHits) => {
					const applied = applyAdminSearchResponse(prevHits, response, mode);
					setHasMore(applied.hasMore);
					setNextOffset(applied.nextOffset);
					setSearchAvailable(applied.searchAvailable);
					setMessage(applied.message);
					setStatus('ready');
					return applied.hits;
				});
			} catch (error) {
				if (controller.signal.aborted) return;
				if (debouncedQueryRef.current !== q) return;
				setStatus('error');
				setMessage(error instanceof Error ? error.message : 'Search failed');
			} finally {
				if (abortRef.current === controller) {
					abortRef.current = null;
				}
				loadMoreInFlightRef.current = false;
			}
		},
		[token, enabled, cancelInFlight, selectedTypes]
	);

	useEffect(() => {
		if (!token || !enabled) {
			cancelInFlight();
			// Reset pagination when auth is unavailable — intentional sync after external gate change.
			// eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale hits when token drops
			setHits([]);
			setHasMore(false);
			setNextOffset(0);
			setStatus('idle');
			return;
		}

		if (!shouldFetchAdminSearch(debouncedQuery)) {
			cancelInFlight();
			setHits([]);
			setHasMore(false);
			setNextOffset(0);
			setSearchAvailable(true);
			setMessage(null);
			setStatus('idle');
			return;
		}

		void fetchPage(debouncedQuery, 0, 'replace');
		// eslint-disable-next-line react-hooks/exhaustive-deps -- reset page 0 on debounced query or type filter change
	}, [debouncedQuery, selectedTypes, token, enabled]);

	const loadMore = useCallback(() => {
		if (!shouldFetchAdminSearch(debouncedQuery)) return;
		if (!hasMore || loadMoreInFlightRef.current || status === 'loading') return;
		loadMoreInFlightRef.current = true;
		void fetchPage(debouncedQuery, nextOffset, 'append');
	}, [debouncedQuery, hasMore, nextOffset, status, fetchPage]);

	return {
		query,
		setQuery,
		debouncedQuery,
		selectedTypes,
		setSelectedTypes,
		toggleEntityType,
		hits,
		hasMore,
		nextOffset,
		searchAvailable,
		message,
		status,
		loadMore,
		reset,
	};
}
