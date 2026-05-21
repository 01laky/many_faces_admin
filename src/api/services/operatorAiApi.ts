import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { OperatorAiConversationListItemDto } from '../models/OperatorAiConversationListItemDto';
import type { OperatorAiMessageDto } from '../models/OperatorAiMessageDto';
import type { OperatorAiMessagesPageDto } from '../models/OperatorAiMessagesPageDto';
import type { OperatorAiModelStatusDto } from '../models/OperatorAiModelStatusDto';
import type { OperatorAiWorkerHostDto } from '../models/OperatorAiWorkerHostDto';

export type OperatorAiConversationListItem = OperatorAiConversationListItemDto;
export type OperatorAiMessage = OperatorAiMessageDto;
export type OperatorAiMessagesPage = OperatorAiMessagesPageDto;

export type OperatorAiMessageAppendedEvent = {
	conversationId: number;
	userMessage: OperatorAiMessage;
	assistantMessage: OperatorAiMessage;
	conversation: OperatorAiConversationListItem;
};

function authHeaders(token: string) {
	return { Authorization: `Bearer ${token}` };
}

export async function listOperatorAiConversations(
	token: string,
	limit = 50
): Promise<OperatorAiConversationListItem[]> {
	OpenAPI.TOKEN = token;
	return __request(OpenAPI, {
		method: 'GET',
		url: '/api/operator-ai/conversations',
		query: { Limit: limit },
	});
}

export async function createOperatorAiConversation(
	token: string,
	title?: string | null
): Promise<OperatorAiConversationListItem> {
	OpenAPI.TOKEN = token;
	return __request(OpenAPI, {
		method: 'POST',
		url: '/api/operator-ai/conversations',
		body: { title: title ?? null },
	});
}

export async function deleteOperatorAiConversation(token: string, id: number): Promise<void> {
	OpenAPI.TOKEN = token;
	await __request(OpenAPI, {
		method: 'DELETE',
		url: '/api/operator-ai/conversations/{id}',
		path: { id },
	});
}

export async function getOperatorAiMessages(
	token: string,
	conversationId: number,
	opts?: { limit?: number; beforeId?: number }
): Promise<OperatorAiMessagesPage> {
	OpenAPI.TOKEN = token;
	return __request(OpenAPI, {
		method: 'GET',
		url: '/api/operator-ai/conversations/{id}/messages',
		path: { id: conversationId },
		query: {
			Limit: opts?.limit,
			BeforeId: opts?.beforeId,
		},
	});
}

export async function getOperatorAiModelStatus(token: string): Promise<OperatorAiModelStatusDto> {
	OpenAPI.TOKEN = token;
	return __request(OpenAPI, {
		method: 'GET',
		url: '/api/operator-ai/model-status',
	});
}

export async function getOperatorAiWorkerHost(token: string): Promise<OperatorAiWorkerHostDto> {
	OpenAPI.TOKEN = token;
	return __request(OpenAPI, {
		method: 'GET',
		url: '/api/operator-ai/worker-host',
	});
}

export async function refreshOperatorAiWorkerHost(token: string): Promise<OperatorAiWorkerHostDto> {
	OpenAPI.TOKEN = token;
	return __request(OpenAPI, {
		method: 'POST',
		url: '/api/operator-ai/worker-host/refresh',
	});
}
