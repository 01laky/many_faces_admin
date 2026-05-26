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

export interface UseFacesParams {
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
}

export interface UseFacesResponse {
	faces: Face[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}
