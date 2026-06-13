import {
	appendUserChatMessage,
	replaceOptimisticUserChatMessage,
	type UiUserChatMessage,
} from '@/utils/userChatMessageMerge';

const optimistic = (content: string): UiUserChatMessage => ({
	id: -1,
	senderId: 'admin-1',
	senderName: 'Admin',
	senderGlobalRole: 'SUPER_ADMIN',
	isPlatformAdministrator: true,
	content,
	sentAt: '2026-01-01T00:00:00Z',
	readAt: null,
	pending: true,
});

const persisted = (id: number, content: string): UiUserChatMessage => ({
	id,
	senderId: 'admin-1',
	senderName: 'Admin',
	senderGlobalRole: 'SUPER_ADMIN',
	isPlatformAdministrator: true,
	content,
	sentAt: '2026-01-01T00:00:01Z',
	readAt: null,
});

describe('userChatMessageMerge', () => {
	it('replaceOptimisticUserChatMessage swaps pending row for hub row', () => {
		const next = replaceOptimisticUserChatMessage(
			[optimistic('hello')],
			persisted(42, 'hello'),
			'admin-1'
		);
		expect(next).toHaveLength(1);
		expect(next[0]?.id).toBe(42);
	});

	it('appendUserChatMessage skips duplicate positive ids', () => {
		const next = appendUserChatMessage([persisted(42, 'hello')], persisted(42, 'hello'));
		expect(next).toHaveLength(1);
	});

	it('replaceOptimisticUserChatMessage leaves persisted row when echo already in list', () => {
		const next = replaceOptimisticUserChatMessage(
			[optimistic('hello'), persisted(42, 'hello')],
			persisted(42, 'hello'),
			'admin-1'
		);
		expect(next).toHaveLength(1);
		expect(next[0]?.id).toBe(42);
	});

	it('removes only one optimistic row when two identical sends are pending', () => {
		const first: UiUserChatMessage = { ...optimistic('hi'), id: -1 };
		const second: UiUserChatMessage = { ...optimistic('hi'), id: -2 };
		const next = replaceOptimisticUserChatMessage([first, second], persisted(100, 'hi'), 'admin-1');
		// one optimistic swapped for the persisted echo; the other identical send stays pending
		expect(next).toHaveLength(2);
		expect(next.filter((m) => m.pending)).toHaveLength(1);
		expect(next.some((m) => m.id === 100)).toBe(true);
	});
});
