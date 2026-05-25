/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MessagesService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiMessagesConversations(): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Messages/conversations',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiMessagesRequests(): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Messages/requests',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiMessagesWith({
		otherUserId,
		limit,
	}: {
		otherUserId: string;
		limit?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Messages/with/{otherUserId}',
			path: {
				otherUserId: otherUserId,
			},
			query: {
				Limit: limit,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiMessagesWithRead({
		otherUserId,
	}: {
		otherUserId: string;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/Messages/with/{otherUserId}/read',
			path: {
				otherUserId: otherUserId,
			},
		});
	}
}
