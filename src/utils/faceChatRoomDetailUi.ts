/** Template B card test ids (CDRM-U1). */
export const CHAT_ROOM_DETAIL_TEST_IDS = {
	overview: 'chat-room-detail-overview',
	description: 'chat-room-detail-description',
	messages: 'chat-room-detail-messages',
	members: 'chat-room-detail-members',
	joinRequests: 'chat-room-detail-join-requests',
} as const;

/** Join-requests card: private room with pending requests only (CDRM-U7). */
export function shouldShowJoinRequestsCard(
	isPublic: boolean,
	pendingJoinRequestCount: number | undefined
): boolean {
	return !isPublic && (pendingJoinRequestCount ?? 0) > 0;
}

/** Management actions visible to global super-admin only (CDRM-U3). */
export function shouldShowManagementCard(isSuperAdmin: boolean): boolean {
	return isSuperAdmin;
}
