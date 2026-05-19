import { describe, expect, it } from 'vitest';
import { buildLocalizedUserChatPath, buildUserChatQuery } from '../userChatPaths';

describe('userChatPaths', () => {
	it('buildUserChatQuery encodes user id', () => {
		expect(buildUserChatQuery('user/a+b')).toBe('?u=user%2Fa%2Bb');
	});

	it('buildLocalizedUserChatPath keeps query off translated segment', () => {
		const path = buildLocalizedUserChatPath(() => '/sk/chat-pouzivatelia', 'creator-1');
		expect(path).toBe('/sk/chat-pouzivatelia?u=creator-1');
	});
});
