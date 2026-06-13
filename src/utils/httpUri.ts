/**
 * True when `value` is an absolute http(s) URL. Used to validate operator worker URLs, which may be
 * plain http on an internal network (unlike `isAllowedHttpsUrl` in safeUrl.ts, which is the stricter
 * https-only allow-list for operator-visible links/media).
 */
export function isAbsoluteHttpUri(value: string): boolean {
	const trimmed = value.trim();
	if (!trimmed) return false;
	try {
		const uri = new URL(trimmed);
		return uri.protocol === 'http:' || uri.protocol === 'https:';
	} catch {
		return false;
	}
}
