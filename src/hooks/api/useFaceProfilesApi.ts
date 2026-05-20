import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../api/core/OpenAPI';
import { request as __request } from '../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../utils/adminTableUtils';
import { parsePaginatedEnvelope, type ApiSortDir } from '../../utils/adminListQuery';

export interface FaceProfileListItem {
	userId: string;
	displayName?: string | null;
	avatarUrl?: string | null;
	commentsCount?: number;
	likesCount?: number;
	reviewsCount?: number;
	isFaceBanned?: boolean;
}

export interface FaceProfileDetail {
	userId: string;
	userFaceProfileId?: number;
	displayName?: string | null;
	nickname?: string | null;
	age?: number | null;
	rod?: string | null;
	avatarUrl?: string | null;
	createdAt?: string;
	updatedAt?: string;
	faceAllowsRecensions?: boolean;
	faceVisibility?: string;
	faceRoleName?: string;
	isActive?: boolean;
	visited?: boolean;
	commentsCount?: number;
	likesCount?: number;
	reviewsCount?: number;
	isFaceBanned?: boolean;
	email?: string | null;
	likedByMe?: boolean;
}

export interface FaceProfileCommentItem {
	id: number;
	userId: string;
	body: string;
	createdAt: string;
	authorDisplayName?: string;
}

export interface FaceProfileReviewItem {
	id: number;
	authorUserId: string;
	title: string;
	text: string;
	stars: number;
	createdAt: string;
	authorDisplayName?: string;
}

export interface UseFaceProfilesParams {
	faceId: number;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
}

export interface UseFaceProfileSocialListParams {
	faceId: number;
	userId: string;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
}

export interface OperatorProfileSocialDeletePayload {
	faceId: number;
	reason: string;
	userMessage: string;
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

const fetchCommentsPage = async (params: UseFaceProfileSocialListParams) => {
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

const fetchReviewsPage = async (params: UseFaceProfileSocialListParams) => {
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

export function useFaceProfileComments(params: UseFaceProfileSocialListParams) {
	return useQuery({
		queryKey: faceProfilesKeys.comments(params),
		queryFn: () => fetchCommentsPage(params),
		enabled: params.faceId > 0 && !!params.userId,
		placeholderData: keepPreviousData,
	});
}

export function useFaceProfileReviews(
	params: UseFaceProfileSocialListParams,
	faceAllowsRecensions: boolean
) {
	return useQuery({
		queryKey: faceProfilesKeys.reviews(params),
		queryFn: () => fetchReviewsPage(params),
		enabled: faceAllowsRecensions && params.faceId > 0 && !!params.userId,
		placeholderData: keepPreviousData,
	});
}

export function useDeleteFaceProfileComment(faceId: number, userId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			commentId,
			payload,
		}: {
			commentId: number;
			payload: OperatorProfileSocialDeletePayload;
		}) => {
			await __request(OpenAPI, {
				method: 'POST',
				url: `/api/operator-content/profile-comments/${commentId}/delete`,
				body: payload,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: faceProfilesKeys.all });
			queryClient.invalidateQueries({ queryKey: faceProfilesKeys.detail(faceId, userId) });
		},
	});
}

export function useDeleteFaceProfileReview(faceId: number, userId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			reviewId,
			payload,
		}: {
			reviewId: number;
			payload: OperatorProfileSocialDeletePayload;
		}) => {
			await __request(OpenAPI, {
				method: 'POST',
				url: `/api/operator-content/profile-reviews/${reviewId}/delete`,
				body: payload,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: faceProfilesKeys.all });
			queryClient.invalidateQueries({ queryKey: faceProfilesKeys.detail(faceId, userId) });
		},
	});
}
