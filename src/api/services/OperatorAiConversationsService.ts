/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateOperatorAiConversationRequest } from '../models/CreateOperatorAiConversationRequest';
import type { OperatorAiConversationListItemDto } from '../models/OperatorAiConversationListItemDto';
import type { OperatorAiMessagesPageDto } from '../models/OperatorAiMessagesPageDto';
import type { OperatorAiModelStatusDto } from '../models/OperatorAiModelStatusDto';
import type { UpdateOperatorAiConversationRequest } from '../models/UpdateOperatorAiConversationRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OperatorAiConversationsService {
	/**
	 * @returns OperatorAiModelStatusDto OK
	 * @throws ApiError
	 */
	public static getApiOperatorAiModelStatus(): CancelablePromise<OperatorAiModelStatusDto> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/operator-ai/model-status',
		});
	}
	/**
	 * @returns OperatorAiConversationListItemDto OK
	 * @throws ApiError
	 */
	public static getApiOperatorAiConversations({
		limit,
	}: {
		limit?: number;
	}): CancelablePromise<Array<OperatorAiConversationListItemDto>> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/operator-ai/conversations',
			query: {
				Limit: limit,
			},
		});
	}
	/**
	 * @returns OperatorAiConversationListItemDto OK
	 * @throws ApiError
	 */
	public static postApiOperatorAiConversations({
		requestBody,
	}: {
		requestBody?: CreateOperatorAiConversationRequest;
	}): CancelablePromise<OperatorAiConversationListItemDto> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/operator-ai/conversations',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns OperatorAiConversationListItemDto OK
	 * @throws ApiError
	 */
	public static getApiOperatorAiConversations1({
		id,
	}: {
		id: number;
	}): CancelablePromise<OperatorAiConversationListItemDto> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/operator-ai/conversations/{id}',
			path: {
				id: id,
			},
		});
	}
	/**
	 * @returns OperatorAiConversationListItemDto OK
	 * @throws ApiError
	 */
	public static patchApiOperatorAiConversations({
		id,
		requestBody,
	}: {
		id: number;
		requestBody?: UpdateOperatorAiConversationRequest;
	}): CancelablePromise<OperatorAiConversationListItemDto> {
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/operator-ai/conversations/{id}',
			path: {
				id: id,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteApiOperatorAiConversations({ id }: { id: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/operator-ai/conversations/{id}',
			path: {
				id: id,
			},
		});
	}
	/**
	 * @returns OperatorAiMessagesPageDto OK
	 * @throws ApiError
	 */
	public static getApiOperatorAiConversationsMessages({
		id,
		limit,
		beforeId,
	}: {
		id: number;
		limit?: number;
		beforeId?: number;
	}): CancelablePromise<OperatorAiMessagesPageDto> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/operator-ai/conversations/{id}/messages',
			path: {
				id: id,
			},
			query: {
				Limit: limit,
				BeforeId: beforeId,
			},
		});
	}
}
