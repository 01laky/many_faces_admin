/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateStoryDto } from '../models/CreateStoryDto';
import type { PublishStoryDto } from '../models/PublishStoryDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StoriesService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiStories({ faceId }: { faceId?: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Stories',
			query: {
				FaceId: faceId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiStories({
		requestBody,
	}: {
		requestBody?: CreateStoryDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/Stories',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiStoriesMe({ faceId }: { faceId?: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Stories/me',
			query: {
				FaceId: faceId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiStories1({
		id,
		faceId,
	}: {
		id: number;
		faceId?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Stories/{id}',
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
	public static deleteApiStories({ id }: { id: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/Stories/{id}',
			path: {
				id: id,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiStoriesPublish({
		id,
		requestBody,
	}: {
		id: number;
		requestBody?: PublishStoryDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/Stories/{id}/publish',
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
	public static postApiStoriesView({
		id,
		faceId,
	}: {
		id: number;
		faceId?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/Stories/{id}/view',
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
	public static postApiStoriesImages({
		id,
		formData,
	}: {
		id: number;
		formData?: {
			File?: Blob;
			Description?: string;
			SortOrder?: number;
		};
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/Stories/{id}/images',
			path: {
				id: id,
			},
			formData: formData,
			mediaType: 'multipart/form-data',
		});
	}
}
