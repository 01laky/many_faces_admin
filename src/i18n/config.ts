import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { fetchLocalizationBundle } from './fetchLocalizationBundle';

export const supportedLanguages = ['en', 'sk', 'cz', 'de', 'fr', 'it'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

let initPromise: Promise<void> | null = null;
let loadedBundleVersion: string | null = null;

function applyLocalizationBundle(
	bundle: Awaited<ReturnType<typeof fetchLocalizationBundle>>
): void {
	for (const lang of supportedLanguages) {
		const nsMap = bundle.resources[lang];
		if (!nsMap) continue;
		for (const [ns, data] of Object.entries(nsMap)) {
			i18n.addResourceBundle(lang, ns, data, true, true);
		}
	}
	loadedBundleVersion = bundle.version;
}

/** Dev-only: pick up new .resx strings without a full browser reload after BeDemo.Api restart. */
export async function refreshI18nIfStale(): Promise<void> {
	if (import.meta.env.PROD) return;

	const bundle = await fetchLocalizationBundle('admin');
	if (loadedBundleVersion === bundle.version) return;

	if (!i18n.isInitialized) {
		await initI18n();
		return;
	}

	applyLocalizationBundle(bundle);
	void i18n.changeLanguage(i18n.resolvedLanguage ?? i18n.language ?? 'en');
}

export async function initI18n(): Promise<void> {
	if (initPromise) return initPromise;

	initPromise = (async () => {
		const bundle = await fetchLocalizationBundle('admin');
		if (!i18n.isInitialized) {
			await i18n
				.use(LanguageDetector)
				.use(initReactI18next)
				.init({
					fallbackLng: 'en',
					supportedLngs: [...supportedLanguages],
					defaultNS: 'common',
					ns: ['common'],
					resources: {},
					react: { useSuspense: false },
					detection: {
						order: ['localStorage', 'navigator', 'htmlTag'],
						caches: ['localStorage'],
					},
					interpolation: { escapeValue: false },
				});
		}

		applyLocalizationBundle(bundle);

		if (import.meta.env.DEV && typeof document !== 'undefined') {
			document.addEventListener('visibilitychange', () => {
				if (document.visibilityState === 'visible') {
					void refreshI18nIfStale();
				}
			});
		}
	})();

	return initPromise;
}

export default i18n;
