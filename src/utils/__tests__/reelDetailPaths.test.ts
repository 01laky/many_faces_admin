import { describe, expect, it } from 'vitest';
import { resolveReelDetailFaceId } from '../reelDetailPaths';

describe('resolveReelDetailFaceId', () => {
	it('prefers shared face with user', () => {
		expect(resolveReelDetailFaceId({ faces: [{ faceId: 10 }, { faceId: 20 }] }, [20, 30])).toBe(20);
	});

	it('falls back to first reel face', () => {
		expect(resolveReelDetailFaceId({ faces: [{ faceId: 10 }] }, [99])).toBe(10);
	});

	it('falls back to first user face', () => {
		expect(resolveReelDetailFaceId({ faces: [] }, [7, 8])).toBe(7);
	});
});
