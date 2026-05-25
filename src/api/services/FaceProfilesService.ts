/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FaceProfileCommentDto } from '../models/FaceProfileCommentDto';
import type { FaceProfileReviewDto } from '../models/FaceProfileReviewDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FaceProfilesService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiFacesProfiles({
		faceId,
		page,
		pageSize,
	}: {
		faceId: number;
		page?: number;
		pageSize?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/faces/{faceId}/profiles',
			path: {
				faceId: faceId,
			},
			query: {
				Page: page,
				PageSize: pageSize,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiFacesProfiles1({
		faceId,
		userId,
	}: {
		faceId: number;
		userId: string;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/faces/{faceId}/profiles/{userId}',
			path: {
				faceId: faceId,
				userId: userId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiFacesProfilesLike({
		faceId,
		userId,
	}: {
		faceId: number;
		userId: string;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/faces/{faceId}/profiles/{userId}/like',
			path: {
				faceId: faceId,
				userId: userId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteApiFacesProfilesLike({
		faceId,
		userId,
	}: {
		faceId: number;
		userId: string;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/faces/{faceId}/profiles/{userId}/like',
			path: {
				faceId: faceId,
				userId: userId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiFacesProfilesLikes({
		faceId,
		userId,
	}: {
		faceId: number;
		userId: string;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/faces/{faceId}/profiles/{userId}/likes',
			path: {
				faceId: faceId,
				userId: userId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiFacesProfilesComments({
		faceId,
		userId,
	}: {
		faceId: number;
		userId: string;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/faces/{faceId}/profiles/{userId}/comments',
			path: {
				faceId: faceId,
				userId: userId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiFacesProfilesComments({
		faceId,
		userId,
		requestBody,
	}: {
		faceId: number;
		userId: string;
		requestBody?: FaceProfileCommentDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/faces/{faceId}/profiles/{userId}/comments',
			path: {
				faceId: faceId,
				userId: userId,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteApiFacesProfilesComments({
		faceId,
		commentId,
	}: {
		faceId: number;
		commentId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/faces/{faceId}/profiles/comments/{commentId}',
			path: {
				faceId: faceId,
				commentId: commentId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiFacesProfilesReviews({
		faceId,
		userId,
	}: {
		faceId: number;
		userId: string;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/faces/{faceId}/profiles/{userId}/reviews',
			path: {
				faceId: faceId,
				userId: userId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiFacesProfilesReviews({
		faceId,
		userId,
		requestBody,
	}: {
		faceId: number;
		userId: string;
		requestBody?: FaceProfileReviewDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/faces/{faceId}/profiles/{userId}/reviews',
			path: {
				faceId: faceId,
				userId: userId,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteApiFacesProfilesReviews({
		faceId,
		reviewId,
	}: {
		faceId: number;
		reviewId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/faces/{faceId}/profiles/reviews/{reviewId}',
			path: {
				faceId: faceId,
				reviewId: reviewId,
			},
		});
	}
}
