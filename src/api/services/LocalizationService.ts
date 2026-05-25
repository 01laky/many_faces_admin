/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LocalizationService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiLocalization({
		app,
		v,
	}: {
		app: string;
		v?: string;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/localization/{app}',
			path: {
				app: app,
			},
			query: {
				V: v,
			},
			errors: {
				304: `Not Modified`,
				404: `Not Found`,
				429: `Too Many Requests`,
			},
		});
	}
}
