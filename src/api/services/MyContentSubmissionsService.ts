/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MyContentSubmissionsService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiMyContentSubmissions(): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/my/content-submissions',
		});
	}
}
