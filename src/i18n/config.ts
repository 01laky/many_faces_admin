import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { fetchLocalizationBundle } from './fetchLocalizationBundle';

export const supportedLanguages = ['en', 'sk', 'cz', 'de', 'fr', 'it'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

let initPromise: Promise<void> | null = null;

export async function initI18n(): Promise<void> {
	if (i18n.isInitialized) return;
	if (initPromise) return initPromise;

	initPromise = (async () => {
		const bundle = await fetchLocalizationBundle('admin');
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

		for (const lang of supportedLanguages) {
			const nsMap = bundle.resources[lang];
			if (!nsMap) continue;
			for (const [ns, data] of Object.entries(nsMap)) {
				i18n.addResourceBundle(lang, ns, data, true, true);
			}
		}
	})();

	return initPromise;
}

export default i18n;
