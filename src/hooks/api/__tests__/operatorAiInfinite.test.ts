import { describe, it, expect } from 'vitest';
import { getOperatorAiMessagesNextPageParam } from '../useOperatorAiApi';
import { getOperatorUserChatMessagesNextPageParam } from '../useOperatorUserChatApi';

describe('infinite message pagination helpers', () => {
	it('getOperatorAiMessagesNextPageParam returns lowest id when hasMore', () => {
		expect(
			getOperatorAiMessagesNextPageParam({
				items: [{ id: 42 } as never, { id: 99 } as never],
				hasMore: true,
			})
		).toBe(42);
	});

	it('getOperatorAiMessagesNextPageParam returns undefined when no more', () => {
		expect(
			getOperatorAiMessagesNextPageParam({
				items: [{ id: 1 } as never],
				hasMore: false,
			})
		).toBeUndefined();
	});

	it('getOperatorUserChatMessagesNextPageParam matches AI contract', () => {
		expect(
			getOperatorUserChatMessagesNextPageParam({
				items: [{ id: 7 } as never],
				hasMore: true,
			})
		).toBe(7);
	});
});
