import type { AdminSearchHitDto } from '@/api/models/AdminSearchAutocompleteDto';
import type { AdminSearchEntityType } from '@/constants/adminGlobalSearchConstants';

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

export type UseAdminGlobalSearchOptions = {
	token: string | null;
	enabled?: boolean;
};
