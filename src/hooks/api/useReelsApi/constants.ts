import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../../utils/adminTableUtils';
import { parsePaginatedEnvelope } from '../../../utils/adminListQuery';
import type { ReelDetail, ReelListItem, UseReelsParams } from './types';

export const fetchReels = async (params: UseReelsParams) => {
	const page = params.page || 1;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	const query: Record<string, string | number> = { page, pageSize };
	if (params.faceId) query.faceId = params.faceId;
	if (params.creatorId?.trim()) query.creatorId = params.creatorId.trim();
	if (params.search?.trim()) query.search = params.search.trim();
	if (params.sortBy) {
		query.sortBy = params.sortBy;
		query.sortDir = params.sortDir ?? 'asc';
	}
	if (params.approvalStatus) query.approvalStatus = params.approvalStatus;
	const response = await __request(OpenAPI, { method: 'GET', url: '/api/reels', query });
	return parsePaginatedEnvelope<ReelListItem>(response, page, pageSize);
};

export const fetchReel = async (id: number, faceId: number): Promise<ReelDetail> => {
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/reels/${id}`,
		query: { faceId },
	});
	return response as ReelDetail;
};

export const reelsKeys = {
	all: ['reels'] as const,
	list: (params: UseReelsParams) => [...reelsKeys.all, 'list', params] as const,
	detail: (id: number, faceId: number) => [...reelsKeys.all, 'detail', id, faceId] as const,
};
