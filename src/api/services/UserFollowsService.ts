/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FollowUserDto } from '../models/FollowUserDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserFollowsService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiUserFollowsFollowing(): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/UserFollows/following',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiUserFollowsFollowers(): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/UserFollows/followers',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiUserFollowsStatus({ userId }: { userId: string }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/UserFollows/status/{userId}',
			path: {
				userId: userId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiUserFollows({
		requestBody,
	}: {
		requestBody?: FollowUserDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/UserFollows',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteApiUserFollows({ userId }: { userId: string }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/UserFollows/{userId}',
			path: {
				userId: userId,
			},
		});
	}
}
