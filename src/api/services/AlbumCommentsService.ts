/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateAlbumCommentDto } from '../models/CreateAlbumCommentDto';
import type { UpdateAlbumCommentDto } from '../models/UpdateAlbumCommentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AlbumCommentsService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiAlbumsComments({ albumId }: { albumId: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/albums/{albumId}/comments',
			path: {
				albumId: albumId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiAlbumsComments({
		albumId,
		requestBody,
	}: {
		albumId: number;
		requestBody?: CreateAlbumCommentDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/albums/{albumId}/comments',
			path: {
				albumId: albumId,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putApiAlbumsComments({
		albumId,
		id,
		requestBody,
	}: {
		albumId: number;
		id: number;
		requestBody?: UpdateAlbumCommentDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/albums/{albumId}/comments/{id}',
			path: {
				albumId: albumId,
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
	public static deleteApiAlbumsComments({
		albumId,
		id,
	}: {
		albumId: number;
		id: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/albums/{albumId}/comments/{id}',
			path: {
				albumId: albumId,
				id: id,
			},
		});
	}
}
