import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';

import type {
	OperatorProfileSocialDeletePayload,
	UseFaceProfilesParams,
	UseFaceProfileSocialListParams,
} from './types';
import {
	fetchProfiles,
	fetchProfile,
	fetchCommentsPage,
	fetchReviewsPage,
	faceProfilesKeys,
} from './constants';

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
