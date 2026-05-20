import { describe, expect, it } from 'vitest';
import {
	isStoryLive,
	mapStoryDetailError,
	resolveStoryDetailFaceId,
	storyStateLabelKey,
} from '../storyDetailUi';

describe('isStoryLive', () => {
	const now = new Date('2026-05-20T12:00:00Z');

	it('returns false for draft', () => {
		expect(isStoryLive('Draft', null, null, now)).toBe(false);
	});

	it('returns true inside published window', () => {
		expect(isStoryLive('Published', '2026-05-20T10:00:00Z', '2026-05-20T14:00:00Z', now)).toBe(
			true
		);
	});

	it('returns false after expiresAt', () => {
		expect(isStoryLive('Published', '2026-05-20T10:00:00Z', '2026-05-20T11:00:00Z', now)).toBe(
			false
		);
	});
});

describe('storyStateLabelKey', () => {
	it('maps known states', () => {
		expect(storyStateLabelKey('Expired')).toBe('pages.storyDetail.stateExpired');
	});
});

describe('resolveStoryDetailFaceId', () => {
	it('prefers shared face with user', () => {
		expect(resolveStoryDetailFaceId({ faces: [{ faceId: 10 }, { faceId: 20 }] }, [20])).toBe(20);
	});

	it('falls back to first story face when no overlap', () => {
		expect(resolveStoryDetailFaceId({ faces: [{ faceId: 10 }] }, [99])).toBe(10);
	});

	it('falls back to first user face when story has no faces', () => {
		expect(resolveStoryDetailFaceId({}, [5, 6])).toBe(5);
	});

	it('returns 0 when nothing is available', () => {
		expect(resolveStoryDetailFaceId({}, [])).toBe(0);
	});
});

describe('mapStoryDetailError', () => {
	it('maps live last-image block', () => {
		expect(mapStoryDetailError(new Error('image_delete_blocked_live'))).toBe(
			'pages.storyDetail.imageDeleteBlockedLive'
		);
	});

	it('returns null for unknown errors', () => {
		expect(mapStoryDetailError(new Error('other'))).toBeNull();
		expect(mapStoryDetailError('x')).toBeNull();
	});
});

describe('storyStateLabelKey edge cases', () => {
	it('returns generic state key for unknown', () => {
		expect(storyStateLabelKey(undefined)).toBe('pages.storyDetail.state');
		expect(storyStateLabelKey('Unknown')).toBe('pages.storyDetail.state');
	});
});
