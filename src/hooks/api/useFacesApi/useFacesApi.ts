import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import { logger } from '../../../utils/logger';
import type { FaceVisibility, Face, UseFacesParams } from './types';
import { fetchFaces, fetchFace, facesKeys } from './constants';

// Fetch single face by ID from API

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
	videoLoungesCreate?: boolean;
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
	videoLoungesCreate?: boolean;
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
