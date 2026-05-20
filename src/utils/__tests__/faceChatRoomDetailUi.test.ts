import { describe, expect, it } from 'vitest';
import {
	CHAT_ROOM_DETAIL_TEST_IDS,
	shouldShowJoinRequestsCard,
	shouldShowManagementCard,
} from '../faceChatRoomDetailUi';
import { buildLocalizedUserChatPath } from '../userChatPaths';

describe('faceChatRoomDetailUi', () => {
	it('CDRM-U1 exposes Template B testids', () => {
		expect(CHAT_ROOM_DETAIL_TEST_IDS.overview).toBe('chat-room-detail-overview');
		expect(CHAT_ROOM_DETAIL_TEST_IDS.messages).toBe('chat-room-detail-messages');
		expect(CHAT_ROOM_DETAIL_TEST_IDS.joinRequests).toBe('chat-room-detail-join-requests');
	});

	it('CDRM-U3 hides management for non–super-admin', () => {
		expect(shouldShowManagementCard(false)).toBe(false);
		expect(shouldShowManagementCard(true)).toBe(true);
	});

	it('CDRM-U4 open chat path includes user-chat query', () => {
		const path = buildLocalizedUserChatPath((p) => `/en/${p}`, 'user-42');
		expect(path).toContain('/en/user-chat');
		expect(path).toContain('u=user-42');
	});

	it('CDRM-U7 hides join-requests for public rooms', () => {
		expect(shouldShowJoinRequestsCard(true, 3)).toBe(false);
		expect(shouldShowJoinRequestsCard(false, 0)).toBe(false);
		expect(shouldShowJoinRequestsCard(false, 2)).toBe(true);
	});
});
