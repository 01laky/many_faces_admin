/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateFaceChatRoomDto } from '../models/CreateFaceChatRoomDto';
import type { CreateSystemFaceChatRoomDto } from '../models/CreateSystemFaceChatRoomDto';
import type { UpdateFaceChatRoomDto } from '../models/UpdateFaceChatRoomDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FaceChatRoomsService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiFacesChatRooms({ faceId }: { faceId: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/faces/{faceId}/chat-rooms',
			path: {
				faceId: faceId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiFacesChatRooms({
		faceId,
		requestBody,
	}: {
		faceId: number;
		requestBody?: CreateFaceChatRoomDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/faces/{faceId}/chat-rooms',
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
	public static getApiFacesChatRooms1({
		faceId,
		roomId,
	}: {
		faceId: number;
		roomId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/faces/{faceId}/chat-rooms/{roomId}',
			path: {
				faceId: faceId,
				roomId: roomId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putApiFacesChatRooms({
		faceId,
		roomId,
		requestBody,
	}: {
		faceId: number;
		roomId: number;
		requestBody?: UpdateFaceChatRoomDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/faces/{faceId}/chat-rooms/{roomId}',
			path: {
				faceId: faceId,
				roomId: roomId,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteApiFacesChatRooms({
		faceId,
		roomId,
	}: {
		faceId: number;
		roomId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/faces/{faceId}/chat-rooms/{roomId}',
			path: {
				faceId: faceId,
				roomId: roomId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiFacesChatRoomsSystem({
		faceId,
		requestBody,
	}: {
		faceId: number;
		requestBody?: CreateSystemFaceChatRoomDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/faces/{faceId}/chat-rooms/system',
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
	public static postApiFacesChatRoomsJoin({
		faceId,
		roomId,
	}: {
		faceId: number;
		roomId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/faces/{faceId}/chat-rooms/{roomId}/join',
			path: {
				faceId: faceId,
				roomId: roomId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiFacesChatRoomsJoinRequests({
		faceId,
		roomId,
	}: {
		faceId: number;
		roomId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/faces/{faceId}/chat-rooms/{roomId}/join-requests',
			path: {
				faceId: faceId,
				roomId: roomId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiFacesChatRoomsRequestsApprove({
		faceId,
		requestId,
	}: {
		faceId: number;
		requestId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/faces/{faceId}/chat-rooms/requests/{requestId}/approve',
			path: {
				faceId: faceId,
				requestId: requestId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiFacesChatRoomsRequestsDeny({
		faceId,
		requestId,
	}: {
		faceId: number;
		requestId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/faces/{faceId}/chat-rooms/requests/{requestId}/deny',
			path: {
				faceId: faceId,
				requestId: requestId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiFacesChatRoomsMessages({
		faceId,
		roomId,
		pageSize,
		beforeId,
	}: {
		faceId: number;
		roomId: number;
		pageSize?: number;
		beforeId?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/faces/{faceId}/chat-rooms/{roomId}/messages',
			path: {
				faceId: faceId,
				roomId: roomId,
			},
			query: {
				PageSize: pageSize,
				BeforeId: beforeId,
			},
		});
	}
}
