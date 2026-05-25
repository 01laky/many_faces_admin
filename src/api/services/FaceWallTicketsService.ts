/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WallTicketCommentDto } from '../models/WallTicketCommentDto';
import type { WallTicketWriteDto } from '../models/WallTicketWriteDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FaceWallTicketsService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiFacesWallTickets({
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
			url: '/api/faces/{faceId}/wall-tickets',
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
	public static postApiFacesWallTickets({
		faceId,
		requestBody,
	}: {
		faceId: number;
		requestBody?: WallTicketWriteDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/faces/{faceId}/wall-tickets',
			path: {
				faceId: faceId,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiFacesWallTickets1({
		faceId,
		ticketId,
	}: {
		faceId: number;
		ticketId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/faces/{faceId}/wall-tickets/{ticketId}',
			path: {
				faceId: faceId,
				ticketId: ticketId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putApiFacesWallTickets({
		faceId,
		ticketId,
		requestBody,
	}: {
		faceId: number;
		ticketId: number;
		requestBody?: WallTicketWriteDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/faces/{faceId}/wall-tickets/{ticketId}',
			path: {
				faceId: faceId,
				ticketId: ticketId,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteApiFacesWallTickets({
		faceId,
		ticketId,
	}: {
		faceId: number;
		ticketId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/faces/{faceId}/wall-tickets/{ticketId}',
			path: {
				faceId: faceId,
				ticketId: ticketId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiFacesWallTicketsLike({
		faceId,
		ticketId,
	}: {
		faceId: number;
		ticketId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/faces/{faceId}/wall-tickets/{ticketId}/like',
			path: {
				faceId: faceId,
				ticketId: ticketId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteApiFacesWallTicketsLike({
		faceId,
		ticketId,
	}: {
		faceId: number;
		ticketId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/faces/{faceId}/wall-tickets/{ticketId}/like',
			path: {
				faceId: faceId,
				ticketId: ticketId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiFacesWallTicketsComments({
		faceId,
		ticketId,
	}: {
		faceId: number;
		ticketId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/faces/{faceId}/wall-tickets/{ticketId}/comments',
			path: {
				faceId: faceId,
				ticketId: ticketId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiFacesWallTicketsComments({
		faceId,
		ticketId,
		requestBody,
	}: {
		faceId: number;
		ticketId: number;
		requestBody?: WallTicketCommentDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/faces/{faceId}/wall-tickets/{ticketId}/comments',
			path: {
				faceId: faceId,
				ticketId: ticketId,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
}
