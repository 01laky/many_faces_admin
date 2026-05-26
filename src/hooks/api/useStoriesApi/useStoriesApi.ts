import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import type { OperatorStoryDeletePayload, UseStoriesParams } from './types';
import { fetchStories, fetchStory, storiesKeys } from './constants';

export function useStories(params: UseStoriesParams) {
	const enabled = (params.faceId ?? 0) > 0 || Boolean(params.creatorId?.trim());
	return useQuery({
		queryKey: storiesKeys.list(params),
		queryFn: () => fetchStories(params),
		enabled,
		placeholderData: keepPreviousData,
	});
}

export function useStory(id: number, faceId: number) {
	return useQuery({
		queryKey: storiesKeys.detail(id, faceId),
		queryFn: () => fetchStory(id, faceId),
		enabled: id > 0 && faceId > 0,
		placeholderData: keepPreviousData,
	});
}

export function useDeleteStory() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({
			storyId,
			payload,
		}: {
			storyId: number;
			payload: OperatorStoryDeletePayload;
		}) => {
			await __request(OpenAPI, {
				method: 'POST',
				url: `/api/operator-content/stories/${storyId}/delete`,
				body: payload,
			});
		},
		onSuccess: (_data, vars) => {
			void qc.invalidateQueries({ queryKey: storiesKeys.all });
			void qc.removeQueries({ queryKey: storiesKeys.detail(vars.storyId, vars.payload.faceId) });
		},
	});
}

export function useDeleteStoryImage() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({
			storyId,
			imageId,
			payload,
		}: {
			storyId: number;
			imageId: number;
			payload: OperatorStoryDeletePayload;
		}) => {
			await __request(OpenAPI, {
				method: 'POST',
				url: `/api/operator-content/stories/${storyId}/images/${imageId}/delete`,
				body: payload,
			});
		},
		onSuccess: (_data, vars) => {
			void qc.invalidateQueries({
				queryKey: storiesKeys.detail(vars.storyId, vars.payload.faceId),
			});
			void qc.invalidateQueries({ queryKey: storiesKeys.all });
		},
	});
}
