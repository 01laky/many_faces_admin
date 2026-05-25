/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlockUserDto } from '../models/BlockUserDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserBlocksService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiUserBlocks(): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/UserBlocks',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiUserBlocks({
		requestBody,
	}: {
		requestBody?: BlockUserDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/UserBlocks',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiUserBlocksStatus({ userId }: { userId: string }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/UserBlocks/status/{userId}',
			path: {
				userId: userId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteApiUserBlocks({ userId }: { userId: string }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/UserBlocks/{userId}',
			path: {
				userId: userId,
			},
		});
	}
}
