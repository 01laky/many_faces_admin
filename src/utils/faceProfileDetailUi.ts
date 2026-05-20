/** Template B card test ids (ADPM-U1, ADPM-U7). */
export const PROFILE_DETAIL_TEST_IDS = {
	overview: 'profile-detail-overview',
	avatar: 'profile-detail-avatar',
	comments: 'profile-detail-comments',
	reviews: 'profile-detail-reviews',
} as const;

export type ProfileDetailDialogMode = 'deleteComment' | 'deleteReview' | 'faceBan';

/** Reviews card only when the face allows recensions (ADPM-U5, ADPM-U9). */
export function shouldShowReviewsCard(faceAllowsRecensions: boolean): boolean {
	return faceAllowsRecensions === true;
}

/** Management actions visible to global super-admin only (ADPM-U3, ADPM-U11). */
export function shouldShowManagementCard(isSuperAdmin: boolean): boolean {
	return isSuperAdmin;
}
