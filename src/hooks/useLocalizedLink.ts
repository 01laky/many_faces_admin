import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { getTranslatedRoute } from '../utils/routeTranslations';

/**
 * Hook that returns a function to create localized links with translated paths
 * Usage: const getLocalizedPath = useLocalizedLink(); <Link to={getLocalizedPath('/login')}>Login</Link>
 * This will translate the path based on current language (e.g., /en/login -> /sk/prihlasenie)
 */
export function useLocalizedLink() {
	const { lang } = useParams<{ lang: string }>();
	const { currentLanguage } = useApp();
	const { t: i18nT } = useTranslation('common');

	const getLocalizedPath = (path: string): string => {
		// Remove leading slash if present
		const cleanPath = path.startsWith('/') ? path.slice(1) : path;

		// Get current language from URL or context
		const targetLang = (lang as typeof currentLanguage) || currentLanguage;

		// Translate the path based on target language
		const translatedPath = getTranslatedRoute(cleanPath, targetLang, (key: string) => {
			// Use i18nT with specific language
			return i18nT(key, { lng: targetLang });
		});

		// Return path with language prefix and translated route
		return `/${targetLang}${translatedPath ? `/${translatedPath}` : ''}`;
	};

	return getLocalizedPath;
}
