/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SendFriendRequestDto } from '../models/SendFriendRequestDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FriendRequestsService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiFriendRequests(): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/FriendRequests',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiFriendRequests({
		requestBody,
	}: {
		requestBody?: SendFriendRequestDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/FriendRequests',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiFriendRequestsAccept({ id }: { id: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/FriendRequests/{id}/accept',
			path: {
				id: id,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiFriendRequestsReject({ id }: { id: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/FriendRequests/{id}/reject',
			path: {
				id: id,
			},
		});
	}
}
