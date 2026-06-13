/**
 * Pure helpers shared by TanStack Table integrations in the admin SPA.
 * Keep pagination and selection rules testable without mounting tables.
 */

/** Default page size for admin data grids (server and client pagination). */
export const ADMIN_TABLE_PAGE_SIZE = 10;

/** Maps 1-based API page numbers to TanStack Table's 0-based `pageIndex`. */
export function wallTicketApiPageToTablePageIndex(apiPage: number): number {
	if (!Number.isFinite(apiPage) || apiPage < 1) return 0;
	return Math.trunc(apiPage) - 1;
}

/** Maps TanStack `pageIndex` back to the wall-tickets list API's 1-based `page` query param. */
export function wallTicketTablePageIndexToApiPage(pageIndex: number): number {
	if (!Number.isFinite(pageIndex) || pageIndex < 0) return 1;
	return Math.trunc(pageIndex) + 1;
}

/** Highlights the active wall-ticket row when detail selection matches list row id. */
export function isWallTicketRowSelected(
	selectedId: number | null | undefined,
	rowId: number
): boolean {
	return selectedId != null && selectedId === rowId;
}

/**
 * Renders a numeric count table cell, showing an em dash for a missing value. Typed as nullable
 * because TanStack `getValue()` is untyped and can return null at runtime despite a `number` cast.
 */
export function formatNullableCount(value: number | null | undefined): string {
	return value == null ? '—' : String(value);
}
