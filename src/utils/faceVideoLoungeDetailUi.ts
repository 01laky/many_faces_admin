/** Template B-lite test ids for VideoLounge operator detail (VL-AD-*). */
export const VIDEO_LOUNGE_DETAIL_TEST_IDS = {
	overview: 'video-lounge-detail-overview',
	description: 'video-lounge-detail-description',
	operatorManagement: 'video-lounge-detail-operator-management',
	operatorParticipants: 'video-lounge-detail-operator-participants',
} as const;

/**
 * Operator moderation card (stealth join, kick, kick all) is shown only when the signed-in
 * user has platform operator access (CanManageAllFaces on the API — platform admin or super).
 */
export function shouldShowOperatorManagementCard(canManageAllFaces: boolean): boolean {
	return canManageAllFaces;
}
