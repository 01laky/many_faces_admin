import { useQuery } from '@tanstack/react-query';
import { OpenAPI } from '../../api/core/OpenAPI';
import { request as __request } from '../../api/core/request';
import { logger } from '../../utils/logger';

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

interface UsePagesParams {
	faceId?: number;
}

// Fetch pages from API
const fetchPages = async (params: UsePagesParams): Promise<Page[]> => {
	logger.info('Fetching pages from API', params);

	try {
		const queryParams: Record<string, string> = {};
		if (params.faceId) {
			queryParams.faceId = params.faceId.toString();
		}

		const queryString = new URLSearchParams(queryParams).toString();
		const url = `/api/pages${queryString ? `?${queryString}` : ''}`;

		const response = await __request(OpenAPI, {
			method: 'GET',
			url,
		});

		return Array.isArray(response) ? response : [];
	} catch (error) {
		logger.error('Error fetching pages', error);
		throw error;
	}
};

// Fetch single page by ID from API
const fetchPage = async (id: number): Promise<Page> => {
	logger.info('Fetching page from API', { id });

	try {
		const response = await __request(OpenAPI, {
			method: 'GET',
			url: `/api/pages/${id}`,
		});

		return response as Page;
	} catch (error) {
		logger.error(`Error fetching page with ID ${id}`, error);
		throw error;
	}
};

export function usePages(params: UsePagesParams = {}) {
	return useQuery({
		queryKey: ['pages', params],
		queryFn: () => fetchPages(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
		keepPreviousData: true,
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
