import type { OperatorAiMessage, OperatorAiMessagesPage } from '../api/services/operatorAiApi';

export type UiChatRole = 'user' | 'ai';

export interface UiChatMessage {
	id: number;
	role: UiChatRole;
	content: string;
	authorEmail?: string | null;
	responseLocale?: string | null;
	createdAt?: string | null;
}

/** Short label for admin UI (e.g. org/model-Instruct-2507 → model, qwen2.5:7b-instruct-q4_K_M → qwen2.5:7b). */
export function formatOperatorAiModelLabel(modelName: string | null | undefined): string {
	if (!modelName?.trim()) return '';
	const base = modelName.includes('/')
		? modelName.slice(modelName.lastIndexOf('/') + 1)
		: modelName;
	return base.replace(/-Instruct.*$/i, '').replace(/-2507$/i, '') || base;
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
		// Carry the header metadata so loaded history renders like live messages.
		// ChatPage → formatMessageHeader reads createdAt + authorEmail; without these,
		// persisted messages showed no timestamp and fell back to a generic author label.
		authorEmail: m.authorEmail,
		responseLocale: m.responseLocale,
		createdAt: m.createdAt,
	};
}

/** Legacy/status or infrastructure errors that must not appear as normal assistant chat. */
export function isTransientAiStatusContent(content: string): boolean {
	const c = content.toLowerCase();
	if (
		(c.includes('načítava') || c.includes('nacitava')) &&
		(c.includes('pamäte') || c.includes('pamate') || c.includes('model'))
	) {
		return true;
	}
	return (
		c.includes('urlopen error') ||
		c.includes('connection refused') ||
		c.startsWith('error:') ||
		c.includes('ai service unavailable')
	);
}

/** Hub-only replies that are not persisted (errors, rate limits, model loading). */
export function isOperatorAiEphemeralReply(content: string, hubErrorCode?: string | null): boolean {
	if (hubErrorCode) return true;
	return isLegacyTransientAiStatusContent(content);
}

/** Pre–hub-error-code ephemeral detection (legacy persisted rows / old servers). */
export function isLegacyTransientAiStatusContent(content: string): boolean {
	if (isTransientAiStatusContent(content)) return true;
	const c = content.toLowerCase();
	return (
		c.includes('conversation not found') ||
		c.includes('too many ai requests') ||
		c.includes('exceeds maximum length') ||
		c.includes('only available to platform operators') ||
		c.includes('statistics-aware ai is only available') ||
		c.includes('režim live nie je') ||
		c.includes('ai služba nie je dostupná') ||
		c.includes('ai služba momentálne nie je') ||
		c.includes('ospravedlňujem sa, ai služba')
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

/** Append a persisted exchange to the React Query messages page (operator inbox). */
export function appendExchangeToMessagesPage(
	page: OperatorAiMessagesPage,
	userMessage: OperatorAiMessage,
	assistantMessage: OperatorAiMessage
): OperatorAiMessagesPage {
	if (page.items.some((m) => m.id === userMessage.id)) return page;
	return {
		...page,
		items: [...page.items, userMessage, assistantMessage],
	};
}

export function conversationTitle(title: string | null | undefined, unnamedLabel: string): string {
	const t = title?.trim();
	return t && t.length > 0 ? t : unnamedLabel;
}
