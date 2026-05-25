/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateAlbumDto } from '../models/CreateAlbumDto';
import type { UpdateAlbumDto } from '../models/UpdateAlbumDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AlbumsService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiAlbums({ faceId }: { faceId?: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Albums',
			query: {
				FaceId: faceId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiAlbums({
		requestBody,
	}: {
		requestBody?: CreateAlbumDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/Albums',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiAlbums1({ id }: { id: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Albums/{id}',
			path: {
				id: id,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putApiAlbums({
		id,
		requestBody,
	}: {
		id: number;
		requestBody?: UpdateAlbumDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/Albums/{id}',
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
	public static deleteApiAlbums({ id }: { id: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/Albums/{id}',
			path: {
				id: id,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiAlbumsUser({ userId }: { userId: string }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Albums/user/{userId}',
			path: {
				userId: userId,
			},
		});
	}
}
