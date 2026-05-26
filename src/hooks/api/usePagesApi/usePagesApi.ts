import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import { logger } from '../../../utils/logger';
import type { Page, UsePagesParams } from './types';
import { fetchPages, fetchPage, pagesKeys } from './constants';

// Fetch single page by ID from API

export function usePages(params: UsePagesParams = {}) {
	return useQuery({
		queryKey: pagesKeys.list(params),
		queryFn: () => fetchPages(params),
		staleTime: 5 * 60 * 1000,
		placeholderData: keepPreviousData,
	});
}

export function usePage(id: number) {
	return useQuery({
		queryKey: ['page', id],
		queryFn: () => fetchPage(id),
		enabled: !!id, // Only fetch if ID is available
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Create page mutation
export interface CreatePageData {
	faceId: number;
	pageTypeId: number;
	name: string;
	description?: string;
	path: string;
	index: number;
	gridSchema?: string | null;
}

const createPageRequest = async (data: CreatePageData): Promise<Page> => {
	logger.info('Creating page via API', { faceId: data.faceId, name: data.name });

	try {
		const response = await __request(OpenAPI, {
			method: 'POST',
			url: '/api/pages',
			body: data,
		});

		return response as Page;
	} catch (error) {
		logger.error('Error creating page', error);
		throw error;
	}
};

export function createPage(data: CreatePageData): Promise<Page> {
	return createPageRequest(data);
}

// Update page mutation
export interface UpdatePageData {
	faceId?: number;
	pageTypeId?: number;
	name?: string;
	description?: string;
	path?: string;
	index?: number;
	gridSchema?: string | null;
}

const updatePageRequest = async (id: number, data: UpdatePageData): Promise<Page> => {
	logger.info('Updating page via API', { id, name: data.name });

	try {
		const response = await __request(OpenAPI, {
			method: 'PUT',
			url: `/api/pages/${id}`,
			body: data,
		});

		return response as Page;
	} catch (error) {
		logger.error('Error updating page', error);
		throw error;
	}
};

export function updatePage(id: number, data: UpdatePageData): Promise<Page> {
	return updatePageRequest(id, data);
}

// Delete page mutation
const deletePageRequest = async (id: number): Promise<void> => {
	logger.info('Deleting page via API', { id });

	try {
		await __request(OpenAPI, {
			method: 'DELETE',
			url: `/api/pages/${id}`,
		});
	} catch (error) {
		logger.error('Error deleting page', error);
		throw error;
	}
};

export function deletePage(id: number): Promise<void> {
	return deletePageRequest(id);
}

export function useCreatePage() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createPage,
		onSuccess: () => void queryClient.invalidateQueries({ queryKey: pagesKeys.all }),
	});
}

export function useUpdatePage() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdatePageData }) => updatePage(id, data),
		onSuccess: (page, { id }) => {
			void queryClient.invalidateQueries({ queryKey: pagesKeys.all });
			void queryClient.invalidateQueries({ queryKey: pagesKeys.detail(id) });
			if (page.faceId) {
				void queryClient.invalidateQueries({ queryKey: ['face', page.faceId] });
			}
		},
	});
}

export function useDeletePage() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id }: { id: number; faceId?: number }) => deletePage(id),
		onSuccess: (_void, { faceId }) => {
			void queryClient.invalidateQueries({ queryKey: pagesKeys.all });
			if (faceId != null) {
				void queryClient.invalidateQueries({ queryKey: pagesKeys.list({ faceId }) });
				void queryClient.invalidateQueries({ queryKey: ['face', faceId] });
			}
		},
	});
}
