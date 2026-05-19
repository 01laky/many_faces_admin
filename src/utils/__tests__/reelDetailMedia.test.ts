import { describe, expect, it } from 'vitest';
import { reelToPreviewItem } from '../reelDetailMedia';

describe('reelToPreviewItem', () => {
	it('maps video reel to ContentMediaItem', () => {
		const item = reelToPreviewItem(5, 'My reel', 'https://example.com/v.mp4');
		expect(item).toEqual({
			id: 5,
			mediaType: 'Video',
			videoUrl: 'https://example.com/v.mp4',
			imageUrl: 'https://example.com/v.mp4',
			sortOrder: 0,
			title: 'My reel',
		});
	});

	it('uses empty urls when video missing', () => {
		const item = reelToPreviewItem(1, 'T', null);
		expect(item.videoUrl).toBe('');
	});
});
