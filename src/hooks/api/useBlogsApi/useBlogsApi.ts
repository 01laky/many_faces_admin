import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import {
	applyModerationDecision,
	moderationKeys,
	type ModerationDecision,
} from '../useContentModerationApi/useContentModerationApi';
import type { OperatorBlogDeletePayload, UseBlogsParams } from './types';
import { fetchBlogs, fetchBlog, blogsKeys } from './constants';

export function useBlogs(params: UseBlogsParams) {
	return useQuery({
		queryKey: blogsKeys.list(params),
		queryFn: () => fetchBlogs(params),
		enabled: (params.faceId ?? 0) > 0 || Boolean(params.creatorId?.trim()),
		placeholderData: keepPreviousData,
	});
}

export function useBlog(id: number, faceId: number) {
	return useQuery({
		queryKey: blogsKeys.detail(id, faceId),
		queryFn: () => fetchBlog(id, faceId),
		enabled: id > 0 && faceId > 0,
		placeholderData: keepPreviousData,
	});
}

export function useDeleteBlog() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			blogId,
			payload,
		}: {
			blogId: number;
			payload: OperatorBlogDeletePayload;
		}) => {
			await __request(OpenAPI, {
				method: 'POST',
				url: `/api/operator-content/blogs/${blogId}/delete`,
				body: payload,
			});
		},
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({ queryKey: blogsKeys.all });
			queryClient.removeQueries({
				queryKey: blogsKeys.detail(vars.blogId, vars.payload.faceId),
			});
			queryClient.invalidateQueries({ queryKey: moderationKeys.all });
		},
	});
}

export function useDeleteBlogImage() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			blogId,
			imageId,
			payload,
		}: {
			blogId: number;
			imageId: number;
			payload: OperatorBlogDeletePayload;
		}) => {
			await __request(OpenAPI, {
				method: 'POST',
				url: `/api/operator-content/blogs/${blogId}/images/${imageId}/delete`,
				body: payload,
			});
		},
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({
				queryKey: blogsKeys.detail(vars.blogId, vars.payload.faceId),
			});
			queryClient.invalidateQueries({ queryKey: blogsKeys.all });
			queryClient.invalidateQueries({ queryKey: moderationKeys.all });
		},
	});
}

export function useBlogModerationAction() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			blogId,
			action,
			decision,
		}: {
			blogId: number;
			faceId: number;
			action: 'approve' | 'reject' | 'remove';
			decision?: ModerationDecision;
		}) => applyModerationDecision('Blog', blogId, action, decision ?? {}),
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({ queryKey: blogsKeys.all });
			queryClient.invalidateQueries({
				queryKey: blogsKeys.detail(vars.blogId, vars.faceId),
			});
			queryClient.invalidateQueries({ queryKey: moderationKeys.all });
		},
	});
}
