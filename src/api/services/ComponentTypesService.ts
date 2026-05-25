/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ComponentTypesService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiComponentTypes(): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/ComponentTypes',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiComponentTypes1({ id }: { id: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/ComponentTypes/{id}',
			path: {
				id: id,
			},
		});
	}
}
