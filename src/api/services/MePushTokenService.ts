/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RegisterPushTokenRequestDto } from '../models/RegisterPushTokenRequestDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MePushTokenService {
	/**
	 * @returns void
	 * @throws ApiError
	 */
	public static postApiMePushToken({
		requestBody,
	}: {
		requestBody?: RegisterPushTokenRequestDto;
	}): CancelablePromise<void> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/me/push-token',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				400: `Bad Request`,
			},
		});
	}
	/**
	 * @returns void
	 * @throws ApiError
	 */
	public static deleteApiMePushToken({
		installationId,
	}: {
		installationId?: string;
	}): CancelablePromise<void> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/me/push-token',
			query: {
				InstallationId: installationId,
			},
		});
	}
}
