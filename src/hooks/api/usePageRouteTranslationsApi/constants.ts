import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import { logger } from '../../../utils/logger';
import type { PageRouteTranslation } from './types';

export const fetchPageRouteTranslations = async (
	pageId: number
): Promise<PageRouteTranslation[]> => {
	logger.info('Fetching page route translations from API', { pageId });

	try {
		const response = await __request(OpenAPI, {
			method: 'GET',
			url: `/api/pages/${pageId}/translations`,
		});

		return Array.isArray(response) ? response : [];
	} catch (error) {
		logger.error(`Error fetching route translations for page ${pageId}`, error);
		throw error;
	}
};
