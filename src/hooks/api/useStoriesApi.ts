import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../api/core/OpenAPI';
import { request as __request } from '../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../utils/adminTableUtils';
import { parsePaginatedEnvelope, type ApiSortDir } from '../../utils/adminListQuery';
import type { StoryFaceRef } from '@/utils/storyDetailUi';
import type { StoryImageDto } from '@/utils/storyDetailMedia';

export interface StoryListItem {
	id: number;
	title: string;
	creatorId?: string;
	creatorName?: string;
	imageCount?: number;
	isPublished?: boolean;
	state?: string;
	publishedAt?: string | null;
	expiresAt?: string | null;
	createdAt?: string;
}

export interface StoryViewerRow {
	viewerUserId: string;
	viewerName?: string;
	viewedAt: string;
}

export interface StoryDetail extends StoryListItem {
	scheduledPublishAt?: string | null;
	updatedAt?: string | null;
	images?: StoryImageDto[];
	faces?: StoryFaceRef[];
	likesCount?: number;
	commentsCount?: number;
	viewCount?: number;
	viewers?: StoryViewerRow[];
}

export interface UseStoriesParams {
	faceId?: number;
	creatorId?: string;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
	isPublished?: boolean;
}

export interface OperatorStoryDeletePayload {
	faceId: number;
	reason: string;
	userMessage: string;
}

const fetchStories = async (params: UseStoriesParams) => {
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
	const enabled = (params.faceId ?? 0) > 0 || Boolean(params.creatorId?.trim());
	return useQuery({
		queryKey: storiesKeys.list(params),
		queryFn: () => fetchStories(params),
		enabled,
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

export function useDeleteStory() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({
			storyId,
			payload,
		}: {
			storyId: number;
			payload: OperatorStoryDeletePayload;
		}) => {
			await __request(OpenAPI, {
				method: 'POST',
				url: `/api/operator-content/stories/${storyId}/delete`,
				body: payload,
			});
		},
		onSuccess: (_data, vars) => {
			void qc.invalidateQueries({ queryKey: storiesKeys.all });
			void qc.removeQueries({ queryKey: storiesKeys.detail(vars.storyId, vars.payload.faceId) });
		},
	});
}

export function useDeleteStoryImage() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({
			storyId,
			imageId,
			payload,
		}: {
			storyId: number;
			imageId: number;
			payload: OperatorStoryDeletePayload;
		}) => {
			await __request(OpenAPI, {
				method: 'POST',
				url: `/api/operator-content/stories/${storyId}/images/${imageId}/delete`,
				body: payload,
			});
		},
		onSuccess: (_data, vars) => {
			void qc.invalidateQueries({
				queryKey: storiesKeys.detail(vars.storyId, vars.payload.faceId),
			});
			void qc.invalidateQueries({ queryKey: storiesKeys.all });
		},
	});
}
