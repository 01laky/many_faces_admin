import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../api/core/OpenAPI';
import { request as __request } from '../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../utils/adminTableUtils';
import { parsePaginatedEnvelope, type ApiSortDir } from '../../utils/adminListQuery';
import {
	applyModerationDecision,
	moderationKeys,
	type ModerationDecision,
} from './useContentModerationApi';

export interface BlogImageDto {
	id: number;
	imageUrl: string;
	sortOrder: number;
}

export interface BlogListItem {
	id: number;
	title: string;
	content?: string;
	creatorId: string;
	creatorName: string;
	faceId?: number;
	faceTitle?: string;
	imageCount?: number;
	images?: BlogImageDto[];
	likesCount?: number;
	commentsCount?: number;
	approvalStatus?: string;
	aiReviewStatus?: string;
	creatorStatusLabel?: string;
	createdAt?: string;
	updatedAt?: string | null;
}

export interface BlogDetail extends BlogListItem {
	contentPlainText?: string;
	aiReviewUserMessage?: string | null;
	humanDecisionReason?: string | null;
	submittedAtUtc?: string | null;
	removedAtUtc?: string | null;
	removalReason?: string | null;
	aiReviewDecision?: string | null;
	aiReviewRiskLevel?: string | null;
	aiReviewFlagsJson?: string | null;
	aiReviewReason?: string | null;
	aiReviewModelVersion?: string | null;
	aiReviewTraceId?: string | null;
	aiReviewConfidence?: number | null;
}

export interface UseBlogsParams {
	faceId?: number;
	creatorId?: string;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
	approvalStatus?: string;
}

export interface OperatorBlogDeletePayload {
	faceId: number;
	reason: string;
	userMessage: string;
}

const fetchBlogs = async (params: UseBlogsParams) => {
	const page = params.page || 1;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	const query: Record<string, string | number> = { page, pageSize };
	if (params.faceId && params.faceId > 0) query.faceId = params.faceId;
	if (params.creatorId?.trim()) query.creatorId = params.creatorId.trim();
	if (params.search?.trim()) query.search = params.search.trim();
	if (params.sortBy) {
		query.sortBy = params.sortBy;
		query.sortDir = params.sortDir ?? 'asc';
	}
	if (params.approvalStatus) query.approvalStatus = params.approvalStatus;
	const response = await __request(OpenAPI, { method: 'GET', url: '/api/blogs', query });
	return parsePaginatedEnvelope<BlogListItem>(response, page, pageSize);
};

const fetchBlog = async (id: number, faceId: number): Promise<BlogDetail> => {
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/blogs/${id}`,
		query: { faceId },
	});
	return response as BlogDetail;
};

export const blogsKeys = {
	all: ['blogs'] as const,
	list: (params: UseBlogsParams) => [...blogsKeys.all, 'list', params] as const,
	detail: (id: number, faceId: number) => [...blogsKeys.all, 'detail', id, faceId] as const,
};

export function useBlogs(params: UseBlogsParams) {
	return useQuery({
		queryKey: blogsKeys.list(params),
		queryFn: () => fetchBlogs(params),
		enabled: (params.faceId ?? 0) > 0 || Boolean(params.creatorId?.trim()),
		placeholderData: keepPreviousData,
	});
}

export function useBlog(id: number, faceId: number) {
	return useQuery({
		queryKey: blogsKeys.detail(id, faceId),
		queryFn: () => fetchBlog(id, faceId),
		enabled: id > 0 && faceId > 0,
		placeholderData: keepPreviousData,
	});
}

export function useDeleteBlog() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			blogId,
			payload,
		}: {
			blogId: number;
			payload: OperatorBlogDeletePayload;
		}) => {
			await __request(OpenAPI, {
				method: 'POST',
				url: `/api/operator-content/blogs/${blogId}/delete`,
				body: payload,
			});
		},
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({ queryKey: blogsKeys.all });
			queryClient.removeQueries({
				queryKey: blogsKeys.detail(vars.blogId, vars.payload.faceId),
			});
			queryClient.invalidateQueries({ queryKey: moderationKeys.all });
		},
	});
}

export function useDeleteBlogImage() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			blogId,
			imageId,
			payload,
		}: {
			blogId: number;
			imageId: number;
			payload: OperatorBlogDeletePayload;
		}) => {
			await __request(OpenAPI, {
				method: 'POST',
				url: `/api/operator-content/blogs/${blogId}/images/${imageId}/delete`,
				body: payload,
			});
		},
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({
				queryKey: blogsKeys.detail(vars.blogId, vars.payload.faceId),
			});
			queryClient.invalidateQueries({ queryKey: blogsKeys.all });
			queryClient.invalidateQueries({ queryKey: moderationKeys.all });
		},
	});
}

export function useBlogModerationAction() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			blogId,
			action,
			decision,
		}: {
			blogId: number;
			faceId: number;
			action: 'approve' | 'reject' | 'remove';
			decision?: ModerationDecision;
		}) => applyModerationDecision('Blog', blogId, action, decision ?? {}),
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({ queryKey: blogsKeys.all });
			queryClient.invalidateQueries({
				queryKey: blogsKeys.detail(vars.blogId, vars.faceId),
			});
			queryClient.invalidateQueries({ queryKey: moderationKeys.all });
		},
	});
}
