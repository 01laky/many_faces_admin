/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminPushTestService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiAdminPushTestSelf(): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/admin/push/test-self',
			errors: {
				400: `Bad Request`,
				403: `Forbidden`,
			},
		});
	}
}
