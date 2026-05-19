/**
 * Fetches the admin static UI bundle from GET /api/localization/admin.
 * Anonymous endpoint — required before login so CMS forms have labels.
 */
import { env } from '../config/env';

export interface LocalizationBundleResponse {
	app: string;
	version: string;
	defaultNamespace: string;
	supportedLanguages: string[];
	resources: Record<string, Record<string, Record<string, unknown>>>;
}

const CACHE_KEY_PREFIX = 'i18nBundle:admin:';

/** Clears cached admin bundle (call after backend .resx deploy if strings still show as keys). */
export function clearLocalizationBundleCache(app: 'admin' = 'admin'): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.removeItem(`${CACHE_KEY_PREFIX}version`);
	localStorage.removeItem(`${CACHE_KEY_PREFIX}body`);
	void app;
}

export async function fetchLocalizationBundle(app: 'admin'): Promise<LocalizationBundleResponse> {
	const base = env.apiUrl.replace(/\/$/, '');
	const cachedVersion =
		typeof localStorage !== 'undefined' ? localStorage.getItem(`${CACHE_KEY_PREFIX}version`) : null;

	const url = new URL(`${base}/api/localization/${app}`);
	// Production only: conditional GET via ?v= — in dev always fetch fresh bundle after .resx changes.
	if (import.meta.env.PROD && cachedVersion) url.searchParams.set('v', cachedVersion);

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: { Accept: 'application/json' },
	});

	if (response.status === 304 && cachedVersion) {
		const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}body`);
		if (raw) return JSON.parse(raw) as LocalizationBundleResponse;
	}

	if (!response.ok) {
		throw new Error(`Localization fetch failed: ${response.status} ${response.statusText}`);
	}

	const body = (await response.json()) as LocalizationBundleResponse;
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(`${CACHE_KEY_PREFIX}version`, body.version);
		localStorage.setItem(`${CACHE_KEY_PREFIX}body`, JSON.stringify(body));
	}
	return body;
}
