/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateProfileRequest } from '../models/UpdateProfileRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProfileService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiProfileMe({ faceId }: { faceId?: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Profile/me',
			query: {
				FaceId: faceId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putApiProfileMe({
		requestBody,
	}: {
		requestBody?: UpdateProfileRequest;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/Profile/me',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiProfileMeAvatar({
		formData,
	}: {
		formData?: {
			File?: Blob;
		};
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/Profile/me/avatar',
			formData: formData,
			mediaType: 'multipart/form-data',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiProfileMeFacesAvatar({
		faceId,
		formData,
	}: {
		faceId: number;
		formData?: {
			File?: Blob;
		};
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/Profile/me/faces/{faceId}/avatar',
			path: {
				faceId: faceId,
			},
			formData: formData,
			mediaType: 'multipart/form-data',
		});
	}
}
