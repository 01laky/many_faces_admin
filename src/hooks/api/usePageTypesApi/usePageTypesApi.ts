import { useQuery } from '@tanstack/react-query';
import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import { logger } from '../../../utils/logger';
import type { PageType } from './types';
import { fetchPageTypes, fetchPageType } from './constants';

// Fetch page types from API

// Fetch single page type by ID from API

export function usePageTypes() {
	return useQuery({
		queryKey: ['pageTypes'],
		queryFn: fetchPageTypes,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function usePageType(id: number) {
	return useQuery({
		queryKey: ['pageType', id],
		queryFn: () => fetchPageType(id),
		enabled: !!id, // Only fetch if ID is available
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Create page type mutation
export interface CreatePageTypeData {
	index: string;
}

const createPageTypeRequest = async (data: CreatePageTypeData): Promise<PageType> => {
	logger.info('Creating page type via API', { index: data.index });

	try {
		const response = await __request(OpenAPI, {
			method: 'POST',
			url: '/api/pagetypes',
			body: data,
		});

		return response as PageType;
	} catch (error) {
		logger.error('Error creating page type', error);
		throw error;
	}
};

export function createPageType(data: CreatePageTypeData): Promise<PageType> {
	return createPageTypeRequest(data);
}

// Update page type mutation
export interface UpdatePageTypeData {
	index?: string;
}

const updatePageTypeRequest = async (id: number, data: UpdatePageTypeData): Promise<PageType> => {
	logger.info('Updating page type via API', { id, index: data.index });

	try {
		const response = await __request(OpenAPI, {
			method: 'PUT',
			url: `/api/pagetypes/${id}`,
			body: data,
		});

		return response as PageType;
	} catch (error) {
		logger.error('Error updating page type', error);
		throw error;
	}
};

export function updatePageType(id: number, data: UpdatePageTypeData): Promise<PageType> {
	return updatePageTypeRequest(id, data);
}

// Delete page type mutation
const deletePageTypeRequest = async (id: number): Promise<void> => {
	logger.info('Deleting page type via API', { id });

	try {
		await __request(OpenAPI, {
			method: 'DELETE',
			url: `/api/pagetypes/${id}`,
		});
	} catch (error) {
		logger.error('Error deleting page type', error);
		throw error;
	}
};

export function deletePageType(id: number): Promise<void> {
	return deletePageTypeRequest(id);
}
