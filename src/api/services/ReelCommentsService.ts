/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateReelCommentDto } from '../models/CreateReelCommentDto';
import type { UpdateReelCommentDto } from '../models/UpdateReelCommentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReelCommentsService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiReelsComments({
		reelId,
		faceId,
	}: {
		reelId: number;
		faceId?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/reels/{reelId}/comments',
			path: {
				reelId: reelId,
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
	public static postApiReelsComments({
		reelId,
		faceId,
		requestBody,
	}: {
		reelId: number;
		faceId?: number;
		requestBody?: CreateReelCommentDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/reels/{reelId}/comments',
			path: {
				reelId: reelId,
			},
			query: {
				FaceId: faceId,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putApiReelsComments({
		reelId,
		id,
		requestBody,
	}: {
		reelId: number;
		id: number;
		requestBody?: UpdateReelCommentDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/reels/{reelId}/comments/{id}',
			path: {
				reelId: reelId,
				id: id,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteApiReelsComments({
		reelId,
		id,
	}: {
		reelId: number;
		id: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/reels/{reelId}/comments/{id}',
			path: {
				reelId: reelId,
				id: id,
			},
		});
	}
}
