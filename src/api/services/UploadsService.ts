/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UploadsService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiUploadsServe({
		path,
		exp,
		sig,
	}: {
		path?: string;
		exp?: number;
		sig?: string;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/uploads/serve',
			query: {
				path: path,
				exp: exp,
				sig: sig,
			},
		});
	}
}
