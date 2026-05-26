import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../../utils/adminTableUtils';
import { parsePaginatedEnvelope } from '../../../utils/adminListQuery';
import type { BlogDetail, BlogListItem, UseBlogsParams } from './types';

export const fetchBlogs = async (params: UseBlogsParams) => {
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

export const fetchBlog = async (id: number, faceId: number): Promise<BlogDetail> => {
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
