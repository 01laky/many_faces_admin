import { describe, expect, it } from 'vitest';
import { blogImagesToMediaItems } from '../blogDetailMedia';

describe('blogImagesToMediaItems', () => {
	it('maps images to ContentMediaItem', () => {
		const items = blogImagesToMediaItems([
			{ id: 1, imageUrl: 'https://example.com/a.jpg', sortOrder: 0 },
		]);
		expect(items).toHaveLength(1);
		expect(items[0].mediaType).toBe('Image');
		expect(items[0].imageUrl).toBe('https://example.com/a.jpg');
	});
});
