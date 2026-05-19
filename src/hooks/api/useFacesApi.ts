import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../api/core/OpenAPI';
import { request as __request } from '../../api/core/request';
import { logger } from '../../utils/logger';
import { ADMIN_TABLE_PAGE_SIZE } from '../../utils/adminTableUtils';
import { parsePaginatedEnvelope } from '../../utils/adminListQuery';
import type { ApiSortDir } from '../../utils/adminListQuery';

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
	createdAt?: string;
	updatedAt?: string | null;
}

interface UseFacesParams {
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
}

interface UseFacesResponse {
	faces: Face[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

const fetchFaces = async (params: UseFacesParams): Promise<UseFacesResponse> => {
	const page = params.page || 1;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	logger.info('Fetching faces from API', params);

	try {
		const response = await __request(OpenAPI, {
			method: 'GET',
			url: '/api/faces',
			query: {
				page,
				pageSize,
				...(params.search?.trim() ? { search: params.search.trim() } : {}),
				...(params.sortBy ? { sortBy: params.sortBy, sortDir: params.sortDir ?? 'asc' } : {}),
			},
		});

		const envelope = parsePaginatedEnvelope<Face>(response, page, pageSize);
		return {
			faces: envelope.items,
			total: envelope.totalCount,
			page: envelope.page,
			pageSize: envelope.pageSize,
			totalPages: envelope.totalPages,
		};
	} catch (error) {
		logger.error('Error fetching faces', error);
		throw error;
	}
};

// Fetch single face by ID from API
const fetchFace = async (id: number): Promise<Face> => {
	logger.info('Fetching face from API', { id });

	try {
		const response = await __request(OpenAPI, {
			method: 'GET',
			url: `/api/faces/${id}`,
		});

		return response as Face;
	} catch (error) {
		logger.error(`Error fetching face with ID ${id}`, error);
		throw error;
	}
};

export const facesKeys = {
	all: ['faces'] as const,
	list: (params: UseFacesParams) => [...facesKeys.all, params] as const,
	detail: (id: number) => ['face', id] as const,
};

export function useFaces(params: UseFacesParams = {}) {
	return useQuery({
		queryKey: facesKeys.list(params),
		queryFn: () => fetchFaces(params),
		staleTime: 5 * 60 * 1000,
		placeholderData: keepPreviousData,
	});
}

export function useFace(id: number) {
	return useQuery({
		queryKey: ['face', id],
		queryFn: () => fetchFace(id),
		enabled: !!id, // Only fetch if ID is available
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Create face mutation
export interface CreateFaceData {
	index: string;
	title: string;
	description?: string;
	gradientSettings?: string;
	isPublic?: boolean;
	visibility?: FaceVisibility;
	allowRecensions?: boolean;
	chatRoomsCreate?: boolean;
}

const createFaceRequest = async (data: CreateFaceData): Promise<Face> => {
	logger.info('Creating face via API', { index: data.index });

	try {
		const response = await __request(OpenAPI, {
			method: 'POST',
			url: '/api/faces',
			body: data,
		});

		return response as Face;
	} catch (error) {
		logger.error('Error creating face', error);
		throw error;
	}
};

export function createFace(data: CreateFaceData): Promise<Face> {
	return createFaceRequest(data);
}

// Update face mutation
export interface UpdateFaceData {
	index?: string;
	title?: string;
	description?: string;
	gradientSettings?: string;
	isPublic?: boolean;
	visibility?: FaceVisibility;
	allowRecensions?: boolean;
	chatRoomsCreate?: boolean;
}

const updateFaceRequest = async (id: number, data: UpdateFaceData): Promise<Face> => {
	logger.info('Updating face via API', { id, index: data.index });

	try {
		const response = await __request(OpenAPI, {
			method: 'PUT',
			url: `/api/faces/${id}`,
			body: data,
		});

		return response as Face;
	} catch (error) {
		logger.error('Error updating face', error);
		throw error;
	}
};

export function updateFace(id: number, data: UpdateFaceData): Promise<Face> {
	return updateFaceRequest(id, data);
}

// Delete face mutation
const deleteFaceRequest = async (id: number): Promise<void> => {
	logger.info('Deleting face via API', { id });

	try {
		await __request(OpenAPI, {
			method: 'DELETE',
			url: `/api/faces/${id}`,
		});
	} catch (error) {
		logger.error('Error deleting face', error);
		throw error;
	}
};

export function deleteFace(id: number): Promise<void> {
	return deleteFaceRequest(id);
}

export function useCreateFace() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createFace,
		onSuccess: () => void queryClient.invalidateQueries({ queryKey: facesKeys.all }),
	});
}

export function useUpdateFace() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateFaceData }) => updateFace(id, data),
		onSuccess: (_face, { id }) => {
			void queryClient.invalidateQueries({ queryKey: facesKeys.all });
			void queryClient.invalidateQueries({ queryKey: facesKeys.detail(id) });
		},
	});
}
