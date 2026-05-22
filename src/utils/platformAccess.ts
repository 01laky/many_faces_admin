/**
 * JWT role sniffing for global SUPER_ADMIN — optional fast-path before capabilities probe.
 * Authoritative admin SPA gate remains GET /api/me/capabilities (`platform:super`).
 */

function readRoleClaim(payload: Record<string, unknown>): unknown {
	return (
		payload.role ??
		payload.roles ??
		payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
	);
}

/** True when the access token carries global SUPER_ADMIN (not portal-only ADMIN). */
export function isSuperAdminFromToken(token: string | null | undefined): boolean {
	if (!token) return false;
	try {
		const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as Record<string, unknown>;
		const role = readRoleClaim(payload);
		if (Array.isArray(role)) {
			return role.includes('SUPER_ADMIN');
		}
		return role === 'SUPER_ADMIN';
	} catch {
		return false;
	}
}
