import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { OpenAPI } from '../../api/core/OpenAPI';
import { request as __request } from '../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../utils/adminTableUtils';
import { parsePaginatedEnvelope, type ApiSortDir } from '../../utils/adminListQuery';

export interface BlogListItem {
	id: number;
	title: string;
	content?: string;
	creatorId: string;
	creatorName: string;
	approvalStatus?: string;
	aiReviewStatus?: string;
	creatorStatusLabel?: string;
	createdAt?: string;
	updatedAt?: string | null;
}

export interface BlogDetail extends BlogListItem {
	aiReviewUserMessage?: string | null;
	humanDecisionReason?: string | null;
	submittedAtUtc?: string | null;
	faceId?: number;
}

export interface UseBlogsParams {
	faceId: number;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
	approvalStatus?: string;
}

const fetchBlogs = async (params: UseBlogsParams) => {
	const page = params.page || 1;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	const query: Record<string, string | number> = { faceId: params.faceId, page, pageSize };
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
		enabled: params.faceId > 0,
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
