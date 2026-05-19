import { describe, it, expect } from 'vitest';
import { buildOpenChatPath } from '@/utils/albumDetailPaths';

describe('AlbumDetailHeader', () => {
	it('open chat href contains creatorId (ADM-U6)', () => {
		const path = buildOpenChatPath('/en', 'creator-abc-123');
		expect(path).toContain('creator-abc-123');
		expect(path).toContain('/user-chat?u=');
	});
});
