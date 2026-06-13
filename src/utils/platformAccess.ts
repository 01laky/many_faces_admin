/**
 * JWT role sniffing for global SUPER_ADMIN — optional fast-path before capabilities probe.
 * Authoritative admin SPA gate remains GET /api/me/capabilities (`platform:super`).
 */

import { decodeJwtPayload } from './jwtUtils';

function readRoleClaim(payload: Record<string, unknown>): unknown {
	return (
		payload.role ??
		payload.roles ??
		payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
	);
}

/** True when the access token carries global SUPER_ADMIN (not portal-only ADMIN). */
export function isSuperAdminFromToken(token: string | null | undefined): boolean {
	// Shared base64url-safe decode (jwtUtils): a raw atob() here threw on tokens whose payload
	// contains `-`/`_`, which silently denied a genuine SUPER_ADMIN on this fast-path.
	const payload = decodeJwtPayload(token);
	if (!payload) return false;
	const role = readRoleClaim(payload);
	if (Array.isArray(role)) {
		return role.includes('SUPER_ADMIN');
	}
	return role === 'SUPER_ADMIN';
}
