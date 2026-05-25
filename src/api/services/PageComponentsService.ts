/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePageComponentDto } from '../models/CreatePageComponentDto';
import type { UpdatePageComponentDto } from '../models/UpdatePageComponentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PageComponentsService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiPageComponentsPage({ pageId }: { pageId: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/PageComponents/page/{pageId}',
			path: {
				pageId: pageId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiPageComponents({ id }: { id: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/PageComponents/{id}',
			path: {
				id: id,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putApiPageComponents({
		id,
		requestBody,
	}: {
		id: number;
		requestBody?: UpdatePageComponentDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/PageComponents/{id}',
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
	public static deleteApiPageComponents({ id }: { id: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/PageComponents/{id}',
			path: {
				id: id,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiPageComponents({
		requestBody,
	}: {
		requestBody?: CreatePageComponentDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/PageComponents',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
}
