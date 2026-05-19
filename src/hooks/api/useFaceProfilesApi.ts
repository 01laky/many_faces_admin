import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { OpenAPI } from '../../api/core/OpenAPI';
import { request as __request } from '../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../utils/adminTableUtils';
import { parsePaginatedEnvelope, type ApiSortDir } from '../../utils/adminListQuery';

export interface FaceProfileListItem {
	userId: string;
	displayName?: string | null;
	avatarUrl?: string | null;
}

export interface FaceProfileDetail extends FaceProfileListItem {
	[key: string]: unknown;
}

export interface UseFaceProfilesParams {
	faceId: number;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
}

const fetchProfiles = async (params: UseFaceProfilesParams) => {
	const page = params.page || 1;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	const query: Record<string, string | number> = { page, pageSize };
	if (params.search?.trim()) query.search = params.search.trim();
	if (params.sortBy) {
		query.sortBy = params.sortBy;
		query.sortDir = params.sortDir ?? 'asc';
	}
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/faces/${params.faceId}/profiles`,
		query,
	});
	return parsePaginatedEnvelope<FaceProfileListItem>(response, page, pageSize);
};

const fetchProfile = async (faceId: number, userId: string): Promise<FaceProfileDetail> => {
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/faces/${faceId}/profiles/${encodeURIComponent(userId)}`,
	});
	return response as FaceProfileDetail;
};

export const faceProfilesKeys = {
	all: ['faceProfiles'] as const,
	list: (params: UseFaceProfilesParams) => [...faceProfilesKeys.all, 'list', params] as const,
	detail: (faceId: number, userId: string) =>
		[...faceProfilesKeys.all, 'detail', faceId, userId] as const,
};

export function useFaceProfiles(params: UseFaceProfilesParams) {
	return useQuery({
		queryKey: faceProfilesKeys.list(params),
		queryFn: () => fetchProfiles(params),
		enabled: params.faceId > 0,
		placeholderData: keepPreviousData,
	});
}

export function useFaceProfile(faceId: number, userId: string) {
	return useQuery({
		queryKey: faceProfilesKeys.detail(faceId, userId),
		queryFn: () => fetchProfile(faceId, userId),
		enabled: faceId > 0 && !!userId,
		placeholderData: keepPreviousData,
	});
}
