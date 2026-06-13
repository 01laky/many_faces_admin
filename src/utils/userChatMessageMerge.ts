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

/**
 * Drop the matching optimistic row, then append the persisted hub message.
 *
 * Removes only the FIRST matching optimistic row (one persisted echo replaces exactly one optimistic
 * send). The previous `filter` removed every pending row with the same content, so sending two identical
 * messages in a row made the second one vanish on the first echo before its own echo arrived.
 */
export function replaceOptimisticUserChatMessage(
	messages: UiUserChatMessage[],
	incoming: UiUserChatMessage,
	operatorUserId: string
): UiUserChatMessage[] {
	const optimisticIndex = messages.findIndex(
		(m) => m.pending && m.id < 0 && m.senderId === operatorUserId && m.content === incoming.content
	);
	const withoutOptimistic =
		optimisticIndex >= 0 ? messages.filter((_, i) => i !== optimisticIndex) : messages;
	return appendUserChatMessage(withoutOptimistic, incoming);
}
