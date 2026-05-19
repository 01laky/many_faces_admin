import type { SortingState } from '@tanstack/react-table';

export type ApiSortDir = 'asc' | 'desc';

export interface ApiSortParams {
	sortBy?: string;
	sortDir?: ApiSortDir;
}

/** Map TanStack sorting state to validated API sort query (first column only). */
export function sortingStateToApi(sorting: SortingState): ApiSortParams {
	const first = sorting[0];
	if (!first?.id) {
		return {};
	}
	return {
		sortBy: first.id,
		sortDir: first.desc ? 'desc' : 'asc',
	};
}

/** Hydrate TanStack <c>sorting</c> state from URL or persisted admin prefs. */
export function apiSortToSortingState(sortBy?: string, sortDir?: string): SortingState {
	if (!sortBy) {
		return [];
	}
	return [{ id: sortBy, desc: sortDir === 'desc' }];
}

/** Clamp table page index when server totalPages shrinks after filter change. */
export function clampPageIndex(pageIndex: number, totalPages: number): number {
	if (totalPages <= 0) {
		return 0;
	}
	return Math.min(Math.max(0, pageIndex), totalPages - 1);
}

/** Builds `?page=1&sortBy=…` omitting undefined/null/empty (shared by manual __request hooks). */
export function buildListQueryString(
	params: Record<string, string | number | boolean | undefined | null>
): string {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null || value === '') {
			continue;
		}
		search.set(key, String(value));
	}
	const qs = search.toString();
	return qs ? `?${qs}` : '';
}

export interface ValidationProblemBody {
	errors?: Record<string, string[]>;
	title?: string;
}

export function parseValidationProblemDetails(body: unknown): string | null {
	if (!body || typeof body !== 'object') {
		return null;
	}
	const errors = (body as ValidationProblemBody).errors;
	if (!errors) {
		return null;
	}
	for (const messages of Object.values(errors)) {
		if (messages?.[0]) {
			return messages[0];
		}
	}
	return null;
}

export function parseSortWhitelistError(body: unknown): string {
	return parseValidationProblemDetails(body) ?? 'Invalid sort field or direction for this list.';
}

/** True when a React Query / OpenAPI list error is a sort/filter validation 400. */
export function isListSortValidationError(error: unknown): boolean {
	if (!error || typeof error !== 'object') {
		return false;
	}
	const status = (error as { status?: number }).status;
	if (status !== 400) {
		return false;
	}
	const body = (error as { body?: unknown }).body;
	return parseValidationProblemDetails(body) != null;
}

export function getListValidationErrorBody(error: unknown): unknown {
	if (!error || typeof error !== 'object') {
		return undefined;
	}
	return (error as { body?: unknown }).body;
}

export interface PaginatedEnvelope<T> {
	items: T[];
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}

/**
 * Normalizes backend list responses to a single envelope shape.
 * Falls back to treating a raw array as a single page (legacy endpoints during migration).
 */
export function parsePaginatedEnvelope<T>(
	response: unknown,
	fallbackPage: number,
	fallbackPageSize: number
): PaginatedEnvelope<T> {
	if (response && typeof response === 'object' && 'items' in (response as object)) {
		const body = response as PaginatedEnvelope<T>;
		const items = Array.isArray(body.items) ? body.items : [];
		const totalCount = typeof body.totalCount === 'number' ? body.totalCount : items.length;
		const pageSize = typeof body.pageSize === 'number' ? body.pageSize : fallbackPageSize;
		const totalPages =
			typeof body.totalPages === 'number'
				? body.totalPages
				: Math.max(1, Math.ceil(totalCount / Math.max(1, pageSize)));
		return {
			items,
			page: typeof body.page === 'number' ? body.page : fallbackPage,
			pageSize,
			totalCount,
			totalPages,
		};
	}

	const arr = Array.isArray(response) ? (response as T[]) : [];
	return {
		items: arr,
		page: fallbackPage,
		pageSize: fallbackPageSize,
		totalCount: arr.length,
		totalPages: Math.max(1, Math.ceil(arr.length / Math.max(1, fallbackPageSize))),
	};
}
