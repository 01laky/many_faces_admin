import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../api/core/OpenAPI';
import { request as __request } from '../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../utils/adminTableUtils';
import { parsePaginatedEnvelope, type ApiSortDir } from '../../utils/adminListQuery';
import type { ContentMediaItem } from '@/types/contentMedia';
import {
	applyModerationDecision,
	moderationKeys,
	type ModerationDecision,
} from './useContentModerationApi';

export interface AlbumListItem {
	id: number;
	title: string;
	description?: string | null;
	albumType: number;
	mediaType: number;
	creatorId: string;
	creatorName: string;
	approvalStatus?: string;
	aiReviewStatus?: string;
	creatorStatusLabel?: string;
	mediaCount?: number;
	createdAt?: string;
	updatedAt?: string | null;
}

export interface AlbumDetail extends AlbumListItem {
	faces?: { faceId: number; title: string }[];
	mediaItems?: ContentMediaItem[];
	aiReviewUserMessage?: string | null;
	humanDecisionReason?: string | null;
	submittedAtUtc?: string | null;
	likesCount?: number;
	commentsCount?: number;
}

export interface OperatorAlbumDeletePayload {
	faceId: number;
	reason: string;
	userMessage: string;
}

export interface UseAlbumsParams {
	faceId: number;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
	approvalStatus?: string;
	albumType?: string;
	mediaType?: string;
}

export interface UseAlbumsListResponse {
	items: AlbumListItem[];
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}

const fetchAlbums = async (params: UseAlbumsParams): Promise<UseAlbumsListResponse> => {
	const page = params.page || 1;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	const query: Record<string, string | number> = {
		faceId: params.faceId,
		page,
		pageSize,
	};
	if (params.search?.trim()) query.search = params.search.trim();
	if (params.sortBy) {
		query.sortBy = params.sortBy;
		query.sortDir = params.sortDir ?? 'asc';
	}
	if (params.approvalStatus) query.approvalStatus = params.approvalStatus;
	if (params.albumType) query.albumType = params.albumType;
	if (params.mediaType) query.mediaType = params.mediaType;

	const response = await __request(OpenAPI, {
		method: 'GET',
		url: '/api/albums',
		query,
	});
	return parsePaginatedEnvelope<AlbumListItem>(response, page, pageSize);
};

const fetchAlbum = async (id: number, faceId: number): Promise<AlbumDetail> => {
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/albums/${id}`,
		query: { faceId },
	});
	return response as AlbumDetail;
};

export const albumsKeys = {
	all: ['albums'] as const,
	list: (params: UseAlbumsParams) => [...albumsKeys.all, 'list', params] as const,
	detail: (id: number, faceId: number) => [...albumsKeys.all, 'detail', id, faceId] as const,
};

export function useAlbums(params: UseAlbumsParams) {
	return useQuery({
		queryKey: albumsKeys.list(params),
		queryFn: () => fetchAlbums(params),
		enabled: params.faceId > 0,
		staleTime: 5 * 60 * 1000,
		placeholderData: keepPreviousData,
	});
}

export function useAlbum(id: number, faceId: number) {
	return useQuery({
		queryKey: albumsKeys.detail(id, faceId),
		queryFn: () => fetchAlbum(id, faceId),
		enabled: id > 0 && faceId > 0,
		staleTime: 30_000,
	});
}

export function useDeleteAlbum() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			albumId,
			payload,
		}: {
			albumId: number;
			payload: OperatorAlbumDeletePayload;
		}) => {
			await __request(OpenAPI, {
				method: 'POST',
				url: `/api/operator-content/albums/${albumId}/delete`,
				body: payload,
			});
		},
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({ queryKey: albumsKeys.all });
			queryClient.removeQueries({
				queryKey: albumsKeys.detail(vars.albumId, vars.payload.faceId),
			});
			queryClient.invalidateQueries({ queryKey: moderationKeys.all });
		},
	});
}

export function useDeleteAlbumMedia() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			albumId,
			mediaId,
			payload,
		}: {
			albumId: number;
			mediaId: number;
			payload: OperatorAlbumDeletePayload;
		}) => {
			await __request(OpenAPI, {
				method: 'POST',
				url: `/api/operator-content/albums/${albumId}/media/${mediaId}/delete`,
				body: payload,
			});
		},
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({
				queryKey: albumsKeys.detail(vars.albumId, vars.payload.faceId),
			});
			queryClient.invalidateQueries({ queryKey: albumsKeys.all });
		},
	});
}

export function useAlbumModerationAction() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			albumId,
			action,
			decision,
		}: {
			albumId: number;
			faceId: number;
			action: 'approve' | 'reject' | 'remove';
			decision?: ModerationDecision;
		}) => applyModerationDecision('Album', albumId, action, decision ?? {}),
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({ queryKey: albumsKeys.all });
			queryClient.invalidateQueries({
				queryKey: albumsKeys.detail(vars.albumId, vars.faceId),
			});
			queryClient.invalidateQueries({ queryKey: moderationKeys.all });
		},
	});
}
