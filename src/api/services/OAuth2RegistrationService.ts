/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RegisterCompleteDto } from '../models/RegisterCompleteDto';
import type { RegisterRequestDto } from '../models/RegisterRequestDto';
import type { RegisterResendDto } from '../models/RegisterResendDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OAuth2RegistrationService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiOauth2RegisterRequest({
		requestBody,
	}: {
		requestBody?: RegisterRequestDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/oauth2/register/request',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiOauth2RegisterResend({
		requestBody,
	}: {
		requestBody?: RegisterResendDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/oauth2/register/resend',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiOauth2RegisterPrefill({ hash }: { hash?: string }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/oauth2/register/prefill',
			query: {
				Hash: hash,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiOauth2RegisterComplete({
		requestBody,
	}: {
		requestBody?: RegisterCompleteDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/oauth2/register/complete',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
}
