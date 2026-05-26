import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../../utils/adminTableUtils';
import { parsePaginatedEnvelope } from '../../../utils/adminListQuery';
import type { StoryDetail, StoryListItem, UseStoriesParams } from './types';

export const fetchStories = async (params: UseStoriesParams) => {
	const page = params.page || 1;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	const query: Record<string, string | number | boolean> = { page, pageSize };
	if (params.faceId != null && params.faceId > 0) query.faceId = params.faceId;
	if (params.creatorId?.trim()) query.creatorId = params.creatorId.trim();
	if (params.search?.trim()) query.search = params.search.trim();
	if (params.sortBy) {
		query.sortBy = params.sortBy;
		query.sortDir = params.sortDir ?? 'asc';
	}
	if (params.isPublished != null) query.isPublished = params.isPublished;
	const response = await __request(OpenAPI, { method: 'GET', url: '/api/stories', query });
	return parsePaginatedEnvelope<StoryListItem>(response, page, pageSize);
};

export const fetchStory = async (id: number, faceId: number): Promise<StoryDetail> => {
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/stories/${id}`,
		query: { faceId },
	});
	return response as StoryDetail;
};

export const storiesKeys = {
	all: ['stories'] as const,
	list: (params: UseStoriesParams) => [...storiesKeys.all, 'list', params] as const,
	detail: (id: number, faceId: number) => [...storiesKeys.all, 'detail', id, faceId] as const,
};
