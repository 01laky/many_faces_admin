import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

/**
 * Hook for navigation that preserves language in URL
 */
export function useLocalizedNavigate() {
	const navigate = useNavigate();
	const { lang } = useParams<{ lang: string }>();
	const { currentLanguage } = useApp();

	const localizedNavigate = (path: string, options?: { replace?: boolean }) => {
		// Remove leading slash if present
		const cleanPath = path.startsWith('/') ? path.slice(1) : path;

		// Get current language from URL or context
		const targetLang = lang || currentLanguage;

		// Navigate with language prefix
		navigate(`/${targetLang}/${cleanPath}`, options);
	};

	return localizedNavigate;
}
