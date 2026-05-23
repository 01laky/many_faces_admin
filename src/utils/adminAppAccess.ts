import { toast } from 'react-toastify';
import { canSuperAdmin } from '../acl/permissions';
import { fetchMeCapabilities } from '../api/meCapabilitiesClient';
import i18n from '../i18n/config';
import { clearAuthStorage } from './authStorage';
import { isSuperAdminFromToken } from './platformAccess';

/**
 * Server-first admin SPA gate: capabilities must include platform:super.
 * Fail closed on network errors — do not enter the app with unknown caps.
 */
export async function assertAdminAppAccessAllowed(
	token: string | null | undefined
): Promise<boolean> {
	if (!token) return false;
	if (!isSuperAdminFromToken(token)) return false;
	try {
		const caps = await fetchMeCapabilities(token);
		return canSuperAdmin(caps);
	} catch {
		return false;
	}
}

/** Clears auth storage and redirects to login (usable outside React tree). */
export function forcePlatformAccessDeniedLogout(message?: string): void {
	clearAuthStorage();

	const langMatch = window.location.pathname.match(/^\/([a-z]{2})\//);
	const lang = langMatch?.[1] ?? 'en';
	const text =
		message ??
		i18n.t('pages.login.superAdminRequired', {
			defaultValue:
				'This console is for platform super-administrators only. Use the customer portal for other accounts.',
		});

	try {
		toast.error(text);
	} catch {
		// i18n may be unavailable in unit tests
	}

	window.location.href = `/${lang}/login`;
}
