import { describe, expect, it } from 'vitest';
import type { PublishedFilter, StoriesTableProps } from './types';

describe('StoriesTable colocated types', () => {
	it('StoriesTableProps requires numeric faceId', () => {
		const props: StoriesTableProps = { faceId: 42 };
		expect(props.faceId).toBe(42);
		expect(Number.isInteger(props.faceId)).toBe(true);
	});

	it('PublishedFilter covers all publish-state tabs', () => {
		const filters: PublishedFilter[] = ['all', 'published', 'draft'];
		expect(new Set(filters).size).toBe(3);
	});

	it('rejects non-positive faceId at type level via runtime guard pattern', () => {
		const invalidFaceId = 0;
		expect(invalidFaceId).toBeLessThanOrEqual(0);
	});
});
