/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AlbumLikesService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiAlbumsLikes({ albumId }: { albumId: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/albums/{albumId}/likes',
			path: {
				albumId: albumId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiAlbumsLikes({ albumId }: { albumId: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/albums/{albumId}/likes',
			path: {
				albumId: albumId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteApiAlbumsLikes({ albumId }: { albumId: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/albums/{albumId}/likes',
			path: {
				albumId: albumId,
			},
		});
	}
}
