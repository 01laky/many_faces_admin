import type { OperatorAiMessage } from '../api/services/operatorAiApi';

export type UiChatRole = 'user' | 'ai';

export interface UiChatMessage {
	id: number;
	role: UiChatRole;
	content: string;
}

export function parseConversationIdFromSearch(search: string): number | null {
	const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
	const raw = params.get('c');
	if (!raw) return null;
	const id = Number.parseInt(raw, 10);
	return Number.isFinite(id) && id > 0 ? id : null;
}

export function conversationIdToSearchParam(id: number | null): string {
	if (id == null) return '';
	return `?c=${id}`;
}

export function mapOperatorMessageToUi(m: OperatorAiMessage): UiChatMessage {
	return {
		id: m.id,
		role: m.role === 'User' ? 'user' : 'ai',
		content: m.content,
	};
}

/** Legacy/status lines saved before hub stopped persisting placeholders. */
export function isTransientAiStatusContent(content: string): boolean {
	const c = content.toLowerCase();
	return (
		(c.includes('načítava') || c.includes('nacitava')) &&
		(c.includes('pamäte') || c.includes('pamate') || c.includes('model'))
	);
}

export function mapPageToUiMessages(items: OperatorAiMessage[]): UiChatMessage[] {
	return items
		.filter((m) => m.role !== 'Assistant' || !isTransientAiStatusContent(m.content))
		.map(mapOperatorMessageToUi);
}

/** Drop orphan user lines whose assistant reply was a transient status placeholder. */
export function filterTransientStatusExchanges(messages: UiChatMessage[]): UiChatMessage[] {
	const out: UiChatMessage[] = [];
	for (let i = 0; i < messages.length; i++) {
		const msg = messages[i];
		const next = messages[i + 1];
		if (msg.role === 'user' && next?.role === 'ai' && isTransientAiStatusContent(next.content)) {
			i++;
			continue;
		}
		if (msg.role === 'ai' && isTransientAiStatusContent(msg.content)) continue;
		out.push(msg);
	}
	return out;
}

/** Merge pages without duplicate ids (older page prepended). */
export function mergeMessagePages(
	existing: UiChatMessage[],
	older: UiChatMessage[]
): UiChatMessage[] {
	const ids = new Set(existing.map((m) => m.id));
	const prepend = older.filter((m) => !ids.has(m.id));
	return [...prepend, ...existing];
}

export function appendExchangeIfNew(
	messages: UiChatMessage[],
	userMessage: OperatorAiMessage,
	assistantMessage: OperatorAiMessage
): UiChatMessage[] {
	if (messages.some((m) => m.id === userMessage.id)) return messages;
	return [
		...messages,
		mapOperatorMessageToUi(userMessage),
		mapOperatorMessageToUi(assistantMessage),
	];
}

export function conversationTitle(title: string | null | undefined, unnamedLabel: string): string {
	const t = title?.trim();
	return t && t.length > 0 ? t : unnamedLabel;
}
