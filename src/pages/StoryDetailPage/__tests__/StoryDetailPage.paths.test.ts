import { describe, expect, it } from 'vitest';
import { buildLocalizedUserChatPath } from '@/utils/userChatPaths';

/** SDM-U: deep links from story detail management (chat path shape). */
describe('StoryDetailPage paths', () => {
	it('open chat href contains creatorId', () => {
		const path = buildLocalizedUserChatPath((segment) => `/en/${segment}`, 'creator-story-42');
		expect(path).toContain('creator-story-42');
		expect(path).toContain('/user-chat?u=');
	});
});
