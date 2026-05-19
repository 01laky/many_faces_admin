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

export interface ReelFaceRef {
	faceId: number;
	title: string;
}

export interface ReelListItem {
	id: number;
	title: string;
	description?: string | null;
	videoUrl?: string;
	creatorId: string;
	creatorName: string;
	faces?: ReelFaceRef[];
	likesCount?: number;
	commentsCount?: number;
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
	aiReviewDecision?: string | null;
	aiReviewRiskLevel?: string | null;
	aiReviewFlagsJson?: string | null;
	aiReviewReason?: string | null;
	aiReviewModelVersion?: string | null;
	aiReviewTraceId?: string | null;
	isLikedByMe?: boolean;
}

export interface OperatorReelDeletePayload {
	faceId: number;
	reason: string;
	userMessage: string;
}

export interface UseReelsParams {
	faceId?: number;
	creatorId?: string;
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
		enabled: (params.faceId ?? 0) > 0 || Boolean(params.creatorId?.trim()),
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

export function useDeleteReel() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			reelId,
			payload,
		}: {
			reelId: number;
			payload: OperatorReelDeletePayload;
		}) => {
			await __request(OpenAPI, {
				method: 'POST',
				url: `/api/operator-content/reels/${reelId}/delete`,
				body: payload,
			});
		},
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({ queryKey: reelsKeys.all });
			queryClient.removeQueries({
				queryKey: reelsKeys.detail(vars.reelId, vars.payload.faceId),
			});
			queryClient.invalidateQueries({ queryKey: moderationKeys.all });
		},
	});
}

export function useReelModerationAction() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			reelId,
			action,
			decision,
		}: {
			reelId: number;
			faceId: number;
			action: 'approve' | 'reject' | 'remove';
			decision?: ModerationDecision;
		}) => applyModerationDecision('Reel', reelId, action, decision ?? {}),
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({ queryKey: reelsKeys.all });
			queryClient.invalidateQueries({
				queryKey: reelsKeys.detail(vars.reelId, vars.faceId),
			});
			queryClient.invalidateQueries({ queryKey: moderationKeys.all });
		},
	});
}
