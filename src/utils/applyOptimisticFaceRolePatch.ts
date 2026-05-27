import type { AdminMeProfile } from '@/api/adminMeProfileApiClient';

/** Optimistic admin-me profile face row after PATCH (SAP-U14). */
export function applyOptimisticFaceRolePatch(
	profile: AdminMeProfile,
	faceId: number,
	userRoleId: number,
	roleName: string | null
): AdminMeProfile {
	return {
		...profile,
		faces: profile.faces.map((face) =>
			face.faceId === faceId
				? {
						...face,
						userRoleId,
						roleName,
						hasMembership: true,
						isActiveParticipant: face.isActiveParticipant,
					}
				: face
		),
	};
}
