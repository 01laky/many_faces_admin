/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DisplayModesService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiDisplayModes(): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/DisplayModes',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiDisplayModes1({ id }: { id: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/DisplayModes/{id}',
			path: {
				id: id,
			},
		});
	}
}
