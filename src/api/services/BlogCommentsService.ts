/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateBlogCommentDto } from '../models/CreateBlogCommentDto';
import type { UpdateBlogCommentDto } from '../models/UpdateBlogCommentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BlogCommentsService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiBlogsComments({ blogId }: { blogId: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/blogs/{blogId}/comments',
			path: {
				blogId: blogId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiBlogsComments({
		blogId,
		requestBody,
	}: {
		blogId: number;
		requestBody?: CreateBlogCommentDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/blogs/{blogId}/comments',
			path: {
				blogId: blogId,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putApiBlogsComments({
		blogId,
		id,
		requestBody,
	}: {
		blogId: number;
		id: number;
		requestBody?: UpdateBlogCommentDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/blogs/{blogId}/comments/{id}',
			path: {
				blogId: blogId,
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
	public static deleteApiBlogsComments({
		blogId,
		id,
	}: {
		blogId: number;
		id: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/blogs/{blogId}/comments/{id}',
			path: {
				blogId: blogId,
				id: id,
			},
		});
	}
}
