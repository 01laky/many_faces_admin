/**
 * ASH1-B7 — allow-list HTTPS URLs for operator-visible links and media src attributes.
 */
export function isAllowedHttpsUrl(raw: string | null | undefined): boolean {
	if (typeof raw !== 'string' || raw.trim() === '') return false;

	try {
		const url = new URL(raw.trim());
		if (url.protocol !== 'https:') return false;
		if (url.username || url.password) return false;
		const host = url.hostname.toLowerCase();
		if (host === 'localhost' || host === '127.0.0.1') return false;
		return true;
	} catch {
		return false;
	}
}

/** Returns url when allowed, otherwise empty string (safe for href/src). */
export function sanitizeHttpsUrl(raw: string | null | undefined): string {
	return isAllowedHttpsUrl(raw) ? raw!.trim() : '';
}
