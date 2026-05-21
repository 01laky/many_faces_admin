import type { OperatorUserChatMessage } from '@/api/operatorUserChatApiClient';

export type UiUserChatMessage = OperatorUserChatMessage & { pending?: boolean };

/** Appends a hub or optimistic message without duplicating by id. */
export function appendUserChatMessage(
	messages: UiUserChatMessage[],
	incoming: UiUserChatMessage
): UiUserChatMessage[] {
	if (messages.some((m) => m.id === incoming.id && incoming.id > 0)) return messages;
	return [...messages, incoming];
}

/** Drop matching optimistic row, then append the persisted hub message. */
export function replaceOptimisticUserChatMessage(
	messages: UiUserChatMessage[],
	incoming: UiUserChatMessage,
	operatorUserId: string
): UiUserChatMessage[] {
	const withoutOptimistic = messages.filter(
		(m) =>
			!(m.pending && m.id < 0 && m.senderId === operatorUserId && m.content === incoming.content)
	);
	return appendUserChatMessage(withoutOptimistic, incoming);
}
