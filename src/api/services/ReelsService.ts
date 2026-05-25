/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateReelDto } from '../models/CreateReelDto';
import type { UpdateReelDto } from '../models/UpdateReelDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReelsService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiReels({ faceId }: { faceId?: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Reels',
			query: {
				FaceId: faceId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiReels({
		requestBody,
	}: {
		requestBody?: CreateReelDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/Reels',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiReels1({
		id,
		faceId,
	}: {
		id: number;
		faceId?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Reels/{id}',
			path: {
				id: id,
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
	public static putApiReels({
		id,
		requestBody,
	}: {
		id: number;
		requestBody?: UpdateReelDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/Reels/{id}',
			path: {
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
	public static deleteApiReels({ id }: { id: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/Reels/{id}',
			path: {
				id: id,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiReelsUser({
		userId,
		faceId,
	}: {
		userId: string;
		faceId?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Reels/user/{userId}',
			path: {
				userId: userId,
			},
			query: {
				FaceId: faceId,
			},
		});
	}
}
