import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import { logger } from '../../../utils/logger';
import { ADMIN_TABLE_PAGE_SIZE } from '../../../utils/adminTableUtils';
import { parsePaginatedEnvelope } from '../../../utils/adminListQuery';
import type { Face, UseFacesParams, UseFacesResponse } from './types';

export const fetchFaces = async (params: UseFacesParams): Promise<UseFacesResponse> => {
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

export const fetchFace = async (id: number): Promise<Face> => {
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
