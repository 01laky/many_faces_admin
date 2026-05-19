import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { OpenAPI } from '../../api/core/OpenAPI';
import { request as __request } from '../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../utils/adminTableUtils';
import { parsePaginatedEnvelope, type ApiSortDir } from '../../utils/adminListQuery';

export interface StoryListItem {
	id: number;
	title: string;
	isPublished?: boolean;
	state?: string;
	publishedAt?: string | null;
	createdAt?: string;
}

export interface StoryDetail extends StoryListItem {
	expiresAt?: string | null;
	creatorId?: string;
}

export interface UseStoriesParams {
	faceId: number;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
	isPublished?: boolean;
}

const fetchStories = async (params: UseStoriesParams) => {
	const page = params.page || 1;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	const query: Record<string, string | number | boolean> = {
		faceId: params.faceId,
		page,
		pageSize,
	};
	if (params.search?.trim()) query.search = params.search.trim();
	if (params.sortBy) {
		query.sortBy = params.sortBy;
		query.sortDir = params.sortDir ?? 'asc';
	}
	if (params.isPublished != null) query.isPublished = params.isPublished;
	const response = await __request(OpenAPI, { method: 'GET', url: '/api/stories', query });
	return parsePaginatedEnvelope<StoryListItem>(response, page, pageSize);
};

const fetchStory = async (id: number, faceId: number): Promise<StoryDetail> => {
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

export function useStories(params: UseStoriesParams) {
	return useQuery({
		queryKey: storiesKeys.list(params),
		queryFn: () => fetchStories(params),
		enabled: params.faceId > 0,
		placeholderData: keepPreviousData,
	});
}

export function useStory(id: number, faceId: number) {
	return useQuery({
		queryKey: storiesKeys.detail(id, faceId),
		queryFn: () => fetchStory(id, faceId),
		enabled: id > 0 && faceId > 0,
		placeholderData: keepPreviousData,
	});
}
