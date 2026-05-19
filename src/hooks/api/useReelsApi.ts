import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { OpenAPI } from '../../api/core/OpenAPI';
import { request as __request } from '../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../utils/adminTableUtils';
import { parsePaginatedEnvelope, type ApiSortDir } from '../../utils/adminListQuery';

export interface ReelListItem {
	id: number;
	title: string;
	description?: string | null;
	videoUrl?: string;
	creatorId: string;
	creatorName: string;
	approvalStatus?: string;
	aiReviewStatus?: string;
	creatorStatusLabel?: string;
	createdAt?: string;
	updatedAt?: string | null;
}

export interface ReelDetail extends ReelListItem {
	aiReviewUserMessage?: string | null;
	humanDecisionReason?: string | null;
	submittedAtUtc?: string | null;
}

export interface UseReelsParams {
	faceId: number;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
	approvalStatus?: string;
}

const fetchReels = async (params: UseReelsParams) => {
	const page = params.page || 1;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	const query: Record<string, string | number> = { faceId: params.faceId, page, pageSize };
	if (params.search?.trim()) query.search = params.search.trim();
	if (params.sortBy) {
		query.sortBy = params.sortBy;
		query.sortDir = params.sortDir ?? 'asc';
	}
	if (params.approvalStatus) query.approvalStatus = params.approvalStatus;
	const response = await __request(OpenAPI, { method: 'GET', url: '/api/reels', query });
	return parsePaginatedEnvelope<ReelListItem>(response, page, pageSize);
};

const fetchReel = async (id: number, faceId: number): Promise<ReelDetail> => {
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

export function useReels(params: UseReelsParams) {
	return useQuery({
		queryKey: reelsKeys.list(params),
		queryFn: () => fetchReels(params),
		enabled: params.faceId > 0,
		placeholderData: keepPreviousData,
	});
}

export function useReel(id: number, faceId: number) {
	return useQuery({
		queryKey: reelsKeys.detail(id, faceId),
		queryFn: () => fetchReel(id, faceId),
		enabled: id > 0 && faceId > 0,
		placeholderData: keepPreviousData,
	});
}
