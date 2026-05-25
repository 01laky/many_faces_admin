/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SearchHealthDto } from '../models/SearchHealthDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SearchService {
	/**
	 * @returns SearchHealthDto OK
	 * @throws ApiError
	 */
	public static getApiSearchHealth(): CancelablePromise<SearchHealthDto> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/search/health',
		});
	}
}
