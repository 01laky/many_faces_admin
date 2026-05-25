/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReelLikesService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiReelsLikes({
		reelId,
		faceId,
	}: {
		reelId: number;
		faceId?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/reels/{reelId}/likes',
			path: {
				reelId: reelId,
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
	public static postApiReelsLikes({
		reelId,
		faceId,
	}: {
		reelId: number;
		faceId?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/reels/{reelId}/likes',
			path: {
				reelId: reelId,
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
	public static deleteApiReelsLikes({
		reelId,
		faceId,
	}: {
		reelId: number;
		faceId?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/reels/{reelId}/likes',
			path: {
				reelId: reelId,
			},
			query: {
				faceId: faceId,
			},
		});
	}
}
