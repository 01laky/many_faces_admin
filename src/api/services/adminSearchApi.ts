import { absoluteScopedUrl } from '@/api/faceApiRouting';
import type { AdminSearchAutocompleteResponse } from '@/api/models/AdminSearchAutocompleteDto';
import { ADMIN_SEARCH_PAGE_SIZE } from '@/constants/adminGlobalSearchConstants';

export type AdminSearchAutocompleteParams = {
	q: string;
	offset?: number;
	pageSize?: number;
};

/** GET /admin/api/search/autocomplete — Bearer token on admin face prefix. */
export async function getAdminSearchAutocomplete(
	token: string,
	params: AdminSearchAutocompleteParams,
	signal?: AbortSignal
): Promise<AdminSearchAutocompleteResponse> {
	const url = new URL(absoluteScopedUrl('/api/search/autocomplete'));
	url.searchParams.set('q', params.q);
	url.searchParams.set('offset', String(params.offset ?? 0));
	url.searchParams.set('pageSize', String(params.pageSize ?? ADMIN_SEARCH_PAGE_SIZE));

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`,
		},
		signal,
	});

	if (!response.ok) {
		throw new Error(`Search autocomplete failed: ${response.status} ${response.statusText}`);
	}

	return (await response.json()) as AdminSearchAutocompleteResponse;
}
