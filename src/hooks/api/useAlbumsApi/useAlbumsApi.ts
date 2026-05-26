import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import {
	applyModerationDecision,
	moderationKeys,
	type ModerationDecision,
} from '../useContentModerationApi/useContentModerationApi';
import type { OperatorAlbumDeletePayload, UseAlbumsParams } from './types';
import { fetchAlbums, fetchAlbum, albumsKeys } from './constants';

export function useAlbums(params: UseAlbumsParams) {
	return useQuery({
		queryKey: albumsKeys.list(params),
		queryFn: () => fetchAlbums(params),
		enabled: (params.faceId ?? 0) > 0 || Boolean(params.creatorId?.trim()),
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
