/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BlogLikesService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiBlogsLikes({ blogId }: { blogId: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/blogs/{blogId}/likes',
			path: {
				blogId: blogId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiBlogsLikes({ blogId }: { blogId: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/blogs/{blogId}/likes',
			path: {
				blogId: blogId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteApiBlogsLikes({ blogId }: { blogId: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/blogs/{blogId}/likes',
			path: {
				blogId: blogId,
			},
		});
	}
}
