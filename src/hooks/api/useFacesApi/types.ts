import type { ApiSortDir } from '../../../utils/adminListQuery';

export type FaceVisibility = 'Public' | 'Private' | 'Face' | 'Hidden';

export interface Face {
	id: number;
	index: string;
	title: string;
	description?: string;
	gradientSettings?: string | null;
	isPublic?: boolean;
	visibility?: FaceVisibility;
	allowRecensions?: boolean;
	chatRoomsCreate?: boolean;
	videoLoungesCreate?: boolean;
	createdAt?: string;
	updatedAt?: string | null;
}

// Declared as a type alias, not an interface: only aliases get TypeScript's implicit index
// signature, which is what lets the params bag be passed to `logger.info(msg, properties)`
// (`Record<string, unknown>`).
export type UseFacesParams = {
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
};

export interface UseFacesResponse {
	faces: Face[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}
