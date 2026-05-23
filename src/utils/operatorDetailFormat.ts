/** Shared display/error helpers for operator detail pages (Template B). */

export function mutationErrorMessage(error: unknown): string {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === 'string' && error.trim()) return error.trim();
	return 'Request failed';
}

export function formatValue(value: string | number | boolean | null | undefined): string {
	if (value === null || value === undefined || value === '') return '—';
	return String(value);
}

export function formatDate(value: string | null | undefined): string {
	if (!value) return '—';
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}
