/** Matches backend `FaceScopeConstants.AdminFaceIndex` — platform admin URL scope, not a tenant face. */
export const ADMIN_SCOPE_FACE_INDEX = 'admin';

export function isAdminScopeFace(face: { index?: string | null } | null | undefined): boolean {
	const index = face?.index?.trim();
	return !!index && index.toLowerCase() === ADMIN_SCOPE_FACE_INDEX;
}
