import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import {
	applyModerationDecision,
	moderationKeys,
	type ModerationDecision,
} from '../useContentModerationApi/useContentModerationApi';
import type { OperatorReelDeletePayload, UseReelsParams } from './types';
import { fetchReels, fetchReel, reelsKeys } from './constants';

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
