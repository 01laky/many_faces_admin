/**
 * Decodes a base64url segment (the JWT encoding: `-`/`_` instead of `+`/`/`, and no `=` padding).
 *
 * Browser `atob` only accepts standard base64, so a raw `atob(segment)` throws on real-world tokens
 * whose payload bytes encode to `-`/`_`. Callers then mis-treat a perfectly valid token as malformed
 * (e.g. force a re-login, or deny a genuine SUPER_ADMIN on the JWT fast-path).
 */
function base64UrlDecode(segment: string): string {
	const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
	const padding = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
	return atob(base64 + padding);
}

/**
 * Parses the JWT payload (second segment) into an object, or returns `null` for a malformed/empty token.
 * Shared by {@link isTokenExpired} and the SUPER_ADMIN fast-path so the decode is base64url-safe in one place.
 */
export function decodeJwtPayload(jwt: string | null | undefined): Record<string, unknown> | null {
	if (!jwt) return null;
	const parts = jwt.split('.');
	if (parts.length < 2 || !parts[1]) return null;
	try {
		const parsed: unknown = JSON.parse(base64UrlDecode(parts[1]));
		return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
	} catch {
		return null;
	}
}

/**
 * Returns true when the JWT should be treated as unusable for session purposes.
 *
 * - Uses standard `exp` (seconds since epoch). If `exp` is missing, the token is treated as **not** expired.
 * - Malformed tokens → expired so callers clear storage and force re-login.
 */
export function isTokenExpired(jwt: string): boolean {
	const payload = decodeJwtPayload(jwt);
	if (!payload) return true;
	const exp = payload.exp;
	if (!exp) return false;
	// RFC 7519: valid only while current time is strictly before exp (compare whole seconds).
	return Math.floor(Date.now() / 1000) >= Number(exp);
}
