import type { ApiSortDir } from '../../../utils/adminListQuery';

export interface Page {
	id: number;
	faceId: number;
	pageTypeId: number;
	name: string;
	description?: string;
	path: string;
	index: number;
	gridSchema?: string | null;
	createdAt?: string;
	updatedAt?: string | null;
}

// Declared as a type alias, not an interface: only aliases get TypeScript's implicit index
// signature, which is what lets the params bag be passed to `logger.info(msg, properties)`
// (`Record<string, unknown>`).
export type UsePagesParams = {
	faceId?: number;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
};

export interface UsePagesListResponse {
	items: Page[];
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}
