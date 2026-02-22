import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import skTranslations from './locales/sk.json';
import czTranslations from './locales/cz.json';

// Supported languages
export const supportedLanguages = ['en', 'sk', 'cz'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

// Configure i18next
i18n
	// Detect user language from browser
	.use(LanguageDetector)
	// Pass the i18n instance to react-i18next
	.use(initReactI18next)
	// Initialize i18next
	.init({
		// Default language
		fallbackLng: 'en',
		// Supported languages
		supportedLngs: supportedLanguages,
		// Default namespace
		defaultNS: 'common',
		// Namespaces
		ns: ['common'],
		// Resources with translations
		resources: {
			en: {
				common: enTranslations,
			},
			sk: {
				common: skTranslations,
			},
			cz: {
				common: czTranslations,
			},
		},
		// React options
		react: {
			useSuspense: false, // Disable suspense for better compatibility
		},
		// Detection options
		detection: {
			// Order of language detection
			order: ['localStorage', 'navigator', 'htmlTag'],
			// Cache user language
			caches: ['localStorage'],
		},
		// Interpolation options
		interpolation: {
			escapeValue: false, // React already escapes values
		},
	});

export default i18n;
