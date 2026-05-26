import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import { logger } from '../../../utils/logger';
import type { PageType } from './types';

export const fetchPageTypes = async (): Promise<PageType[]> => {
	logger.info('Fetching page types from API');

	try {
		const response = await __request(OpenAPI, {
			method: 'GET',
			url: '/api/pagetypes',
		});

		return Array.isArray(response) ? response : [];
	} catch (error) {
		logger.error('Error fetching page types', error);
		throw error;
	}
};

export const fetchPageType = async (id: number): Promise<PageType> => {
	logger.info('Fetching page type from API', { id });

	try {
		const response = await __request(OpenAPI, {
			method: 'GET',
			url: `/api/pagetypes/${id}`,
		});

		return response as PageType;
	} catch (error) {
		logger.error(`Error fetching page type with ID ${id}`, error);
		throw error;
	}
};
