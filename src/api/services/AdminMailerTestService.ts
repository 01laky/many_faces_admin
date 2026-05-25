/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminMailerTestService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiAdminMailerTestSelf(): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/admin/mailer/test-self',
			errors: {
				400: `Bad Request`,
				401: `Unauthorized`,
				403: `Forbidden`,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiAdminMailerPilotLink(): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/admin/mailer/pilot-link',
		});
	}
}
