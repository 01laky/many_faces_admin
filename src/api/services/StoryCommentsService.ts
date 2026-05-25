/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateStoryCommentDto } from '../models/CreateStoryCommentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StoryCommentsService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiStoriesComments({
		storyId,
		faceId,
	}: {
		storyId: number;
		faceId?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/stories/{storyId}/comments',
			path: {
				storyId: storyId,
			},
			query: {
				FaceId: faceId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiStoriesComments({
		storyId,
		faceId,
		requestBody,
	}: {
		storyId: number;
		faceId?: number;
		requestBody?: CreateStoryCommentDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/stories/{storyId}/comments',
			path: {
				storyId: storyId,
			},
			query: {
				FaceId: faceId,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
}
