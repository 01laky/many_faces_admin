/**
 * Operator AI shared support inbox — REST under `/admin/api/operator-ai/conversations`.
 */
import { getApiErrorMessage } from '../../utils/apiErrorMessage';
import { absoluteScopedUrl } from '../faceApiRouting';

export interface OperatorAiConversationListItem {
	id: number;
	title: string | null;
	createdByUserId: string;
	createdByDisplayName: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface OperatorAiMessage {
	id: number;
	role: string;
	content: string;
	statsMode: string | null;
	createdByUserId: string | null;
	createdAt: string;
}

export interface OperatorAiMessagesPage {
	items: OperatorAiMessage[];
	hasMore: boolean;
	oldestId: number | null;
}

export interface OperatorAiModelStatus {
	ready: boolean;
	loading: boolean;
	unavailable: boolean;
	modelName: string | null;
}

export interface OperatorAiMessageAppendedEvent {
	conversationId: number;
	userMessage: OperatorAiMessage;
	assistantMessage: OperatorAiMessage;
	conversation: OperatorAiConversationListItem;
}

async function authFetch(path: string, token: string, init?: RequestInit) {
	return fetch(absoluteScopedUrl(path), {
		...init,
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${token}`,
			...(init?.headers as Record<string, string>),
		},
	});
}

export async function listOperatorAiConversations(
	token: string,
	limit = 50
): Promise<OperatorAiConversationListItem[]> {
	const res = await authFetch(`/api/operator-ai/conversations?limit=${limit}`, token);
	if (!res.ok) {
		throw new Error(await getApiErrorMessage(res, 'Failed to load conversations'));
	}
	return (await res.json()) as OperatorAiConversationListItem[];
}

export async function createOperatorAiConversation(
	token: string,
	title?: string
): Promise<OperatorAiConversationListItem> {
	const res = await authFetch('/api/operator-ai/conversations', token, {
		method: 'POST',
		body: JSON.stringify({ title: title ?? null }),
	});
	if (!res.ok) {
		throw new Error(await getApiErrorMessage(res, 'Failed to create conversation'));
	}
	return (await res.json()) as OperatorAiConversationListItem;
}

export async function deleteOperatorAiConversation(token: string, id: number): Promise<void> {
	const res = await authFetch(`/api/operator-ai/conversations/${id}`, token, { method: 'DELETE' });
	if (!res.ok) {
		throw new Error(await getApiErrorMessage(res, 'Failed to delete conversation'));
	}
}

export async function getOperatorAiModelStatus(token: string): Promise<OperatorAiModelStatus> {
	const res = await authFetch('/api/operator-ai/model-status', token);
	if (!res.ok) {
		throw new Error(await getApiErrorMessage(res, 'Failed to load AI model status'));
	}
	return (await res.json()) as OperatorAiModelStatus;
}

export async function getOperatorAiMessages(
	token: string,
	conversationId: number,
	params?: { limit?: number; beforeId?: number }
): Promise<OperatorAiMessagesPage> {
	const q = new URLSearchParams();
	if (params?.limit != null) q.set('limit', String(params.limit));
	if (params?.beforeId != null) q.set('beforeId', String(params.beforeId));
	const qs = q.toString();
	const res = await authFetch(
		`/api/operator-ai/conversations/${conversationId}/messages${qs ? `?${qs}` : ''}`,
		token
	);
	if (!res.ok) {
		throw new Error(await getApiErrorMessage(res, 'Failed to load messages'));
	}
	return (await res.json()) as OperatorAiMessagesPage;
}
