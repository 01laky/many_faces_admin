import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../../utils/adminTableUtils';
import { parsePaginatedEnvelope } from '../../../utils/adminListQuery';
import type {
	FaceProfileCommentItem,
	FaceProfileDetail,
	FaceProfileListItem,
	FaceProfileReviewItem,
	UseFaceProfileSocialListParams,
	UseFaceProfilesParams,
} from './types';

export const fetchProfiles = async (params: UseFaceProfilesParams) => {
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

export const fetchProfile = async (faceId: number, userId: string): Promise<FaceProfileDetail> => {
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/faces/${faceId}/profiles/${encodeURIComponent(userId)}`,
	});
	return response as FaceProfileDetail;
};

export const fetchCommentsPage = async (params: UseFaceProfileSocialListParams) => {
	const page = params.page || 1;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	const query: Record<string, string | number> = { page, pageSize };
	if (params.search?.trim()) query.search = params.search.trim();
	if (params.sortBy) {
		query.sortBy = params.sortBy;
		query.sortDir = params.sortDir ?? 'desc';
	}
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/faces/${params.faceId}/profiles/${encodeURIComponent(params.userId)}/comments`,
		query,
	});
	return parsePaginatedEnvelope<FaceProfileCommentItem>(response, page, pageSize);
};

export const fetchReviewsPage = async (params: UseFaceProfileSocialListParams) => {
	const page = params.page || 1;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	const query: Record<string, string | number> = { page, pageSize };
	if (params.search?.trim()) query.search = params.search.trim();
	if (params.sortBy) {
		query.sortBy = params.sortBy;
		query.sortDir = params.sortDir ?? 'desc';
	}
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/faces/${params.faceId}/profiles/${encodeURIComponent(params.userId)}/reviews`,
		query,
	});
	return parsePaginatedEnvelope<FaceProfileReviewItem>(response, page, pageSize);
};

export const faceProfilesKeys = {
	all: ['faceProfiles'] as const,
	list: (params: UseFaceProfilesParams) => [...faceProfilesKeys.all, 'list', params] as const,
	detail: (faceId: number, userId: string) =>
		[...faceProfilesKeys.all, 'detail', faceId, userId] as const,
	comments: (params: UseFaceProfileSocialListParams) =>
		[...faceProfilesKeys.all, 'comments', params] as const,
	reviews: (params: UseFaceProfileSocialListParams) =>
		[...faceProfilesKeys.all, 'reviews', params] as const,
};
