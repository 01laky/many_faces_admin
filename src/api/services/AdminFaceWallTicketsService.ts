/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminFaceWallTicketsService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiAdminFacesWallTickets({
		faceId,
		page = 1,
		pageSize = 10,
	}: {
		faceId: number;
		page?: number;
		pageSize?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/admin/faces/{faceId}/wall-tickets',
			path: {
				faceId: faceId,
			},
			query: {
				page: page,
				pageSize: pageSize,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiAdminFacesWallTickets1({
		faceId,
		ticketId,
	}: {
		faceId: number;
		ticketId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/admin/faces/{faceId}/wall-tickets/{ticketId}',
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
	public static deleteApiAdminFacesWallTickets({
		faceId,
		ticketId,
	}: {
		faceId: number;
		ticketId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/admin/faces/{faceId}/wall-tickets/{ticketId}',
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
	public static postApiAdminFacesWallTicketsApprove({
		faceId,
		ticketId,
	}: {
		faceId: number;
		ticketId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/admin/faces/{faceId}/wall-tickets/{ticketId}/approve',
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
	public static postApiAdminFacesWallTicketsDeny({
		faceId,
		ticketId,
	}: {
		faceId: number;
		ticketId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/admin/faces/{faceId}/wall-tickets/{ticketId}/deny',
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
	public static deleteApiAdminFacesWallTicketsComments({
		faceId,
		ticketId,
		commentId,
	}: {
		faceId: number;
		ticketId: number;
		commentId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/admin/faces/{faceId}/wall-tickets/{ticketId}/comments/{commentId}',
			path: {
				faceId: faceId,
				ticketId: ticketId,
				commentId: commentId,
			},
		});
	}
}
