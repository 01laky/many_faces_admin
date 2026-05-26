import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import { logger } from '../../../utils/logger';
import { ADMIN_TABLE_PAGE_SIZE } from '../../../utils/adminTableUtils';
import { parsePaginatedEnvelope } from '../../../utils/adminListQuery';
import type { Page, UsePagesParams, UsePagesListResponse } from './types';

export const fetchPages = async (params: UsePagesParams): Promise<UsePagesListResponse> => {
	const page = params.page || 1;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	logger.info('Fetching pages from API', params);

	try {
		const response = await __request(OpenAPI, {
			method: 'GET',
			url: '/api/pages',
			query: {
				...(params.faceId ? { faceId: params.faceId } : {}),
				page,
				pageSize,
				...(params.search?.trim() ? { search: params.search.trim() } : {}),
				...(params.sortBy ? { sortBy: params.sortBy, sortDir: params.sortDir ?? 'asc' } : {}),
			},
		});

		return parsePaginatedEnvelope<Page>(response, page, pageSize);
	} catch (error) {
		logger.error('Error fetching pages', error);
		throw error;
	}
};

export const fetchPage = async (id: number): Promise<Page> => {
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

export const pagesKeys = {
	all: ['pages'] as const,
	list: (params: UsePagesParams) => [...pagesKeys.all, params] as const,
	detail: (id: number) => ['page', id] as const,
};
