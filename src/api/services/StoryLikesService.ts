/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StoryLikesService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiStoriesLikes({
		storyId,
		faceId,
	}: {
		storyId: number;
		faceId?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/stories/{storyId}/likes',
			path: {
				storyId: storyId,
			},
			query: {
				faceId: faceId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiStoriesLikes({
		storyId,
		faceId,
	}: {
		storyId: number;
		faceId?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/stories/{storyId}/likes',
			path: {
				storyId: storyId,
			},
			query: {
				faceId: faceId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteApiStoriesLikes({
		storyId,
		faceId,
	}: {
		storyId: number;
		faceId?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/stories/{storyId}/likes',
			path: {
				storyId: storyId,
			},
			query: {
				faceId: faceId,
			},
		});
	}
}
