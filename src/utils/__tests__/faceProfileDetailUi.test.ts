import { describe, expect, it } from 'vitest';
import {
	PROFILE_DETAIL_TEST_IDS,
	shouldShowManagementCard,
	shouldShowReviewsCard,
} from '../faceProfileDetailUi';

describe('faceProfileDetailUi', () => {
	it('ADPM-U9: shouldShowReviewsCard is true only when recensions allowed', () => {
		expect(shouldShowReviewsCard(true)).toBe(true);
		expect(shouldShowReviewsCard(false)).toBe(false);
	});

	it('ADPM-U11: shouldShowManagementCard follows super-admin flag', () => {
		expect(shouldShowManagementCard(true)).toBe(true);
		expect(shouldShowManagementCard(false)).toBe(false);
	});

	it('ADPM-U7: likes test id is not part of profile detail surface', () => {
		expect(Object.values(PROFILE_DETAIL_TEST_IDS)).not.toContain('profile-detail-likes');
	});
});
