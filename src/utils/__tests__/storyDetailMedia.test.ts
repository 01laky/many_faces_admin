import { describe, expect, it } from 'vitest';
import { storyImagesToMediaItems } from '../storyDetailMedia';

describe('storyImagesToMediaItems', () => {
	it('sorts by sortOrder', () => {
		const items = storyImagesToMediaItems(1, 'T', [
			{ id: 2, imageUrl: 'b', sortOrder: 1 },
			{ id: 1, imageUrl: 'a', sortOrder: 0 },
		]);
		expect(items.map((i) => i.id)).toEqual([1, 2]);
	});
});
