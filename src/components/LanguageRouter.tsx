import { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, type SupportedLanguage } from '../i18n/config';

/**
 * LanguageRouter component that handles language-based routing
 * Ensures URL always has language prefix and syncs with i18n
 */
export function LanguageRouter() {
	const { lang } = useParams<{ lang: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const { i18n } = useTranslation();

	useEffect(() => {
		// Validate language from URL
		const validLang = supportedLanguages.includes(lang as SupportedLanguage)
			? (lang as SupportedLanguage)
			: 'en';

		// If language in URL doesn't match current i18n language, change it
		if (i18n.language !== validLang) {
			i18n.changeLanguage(validLang);
		}

		// If URL doesn't have valid language, redirect to default
		if (!validLang || !supportedLanguages.includes(lang as SupportedLanguage)) {
			const pathWithoutLang = location.pathname.replace(/^\/[^/]+/, '') || '/';
			navigate(`/${validLang}${pathWithoutLang}`, { replace: true });
		}
	}, [lang, i18n, navigate, location.pathname]);

	return <Outlet />;
}
