/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateUserModel } from '../models/CreateUserModel';
import type { UpdateUserModel } from '../models/UpdateUserModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiUsers({
		page,
		pageSize,
		search,
		forAddFriend,
	}: {
		page?: number;
		pageSize?: number;
		search?: string;
		forAddFriend?: boolean;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Users',
			query: {
				Page: page,
				PageSize: pageSize,
				Search: search,
				ForAddFriend: forAddFriend,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiUsers({
		requestBody,
	}: {
		requestBody?: CreateUserModel;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/Users',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiUsers1({ id }: { id: string }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Users/{id}',
			path: {
				id: id,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putApiUsers({
		id,
		requestBody,
	}: {
		id: string;
		requestBody?: UpdateUserModel;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/Users/{id}',
			path: {
				id: id,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
}
