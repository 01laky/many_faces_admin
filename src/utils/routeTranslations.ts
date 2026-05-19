import type { SupportedLanguage } from '../i18n/config';

/**
 * Internal route ids (see useAdminRoutePaths) → canonical URL slug.
 * React Router registers slugs from getAllRouteTranslations; menu links use kebab-case paths.
 */
const ROUTE_ID_TO_SLUG: Record<string, string> = {
	userChat: 'user-chat',
};

function resolveRouteSlug(routeIdOrSlug: string): string {
	return ROUTE_ID_TO_SLUG[routeIdOrSlug] ?? routeIdOrSlug;
}

// Map of English route names to their keys in i18n
const routeKeys: Record<string, string> = {
	login: 'routes.login',
	homepage: 'routes.homepage',
	dashboard: 'routes.dashboard',
	users: 'routes.users',
	faces: 'routes.faces',
	moderation: 'routes.moderation',
	chat: 'routes.chat',
	userChat: 'routes.userChat',
	'user-chat': 'routes.userChat',
	settings: 'routes.settings',
};

// Map of route keys to English route names (reverse lookup)
const routeKeyToEnglish: Record<string, string> = {
	'routes.login': 'login',
	'routes.homepage': 'homepage',
	'routes.dashboard': 'dashboard',
	'routes.users': 'users',
	'routes.faces': 'faces',
	'routes.moderation': 'moderation',
	'routes.chat': 'chat',
	'routes.userChat': 'user-chat',
	'routes.settings': 'settings',
};

/**
 * Get translated route path for a given language
 * @param englishPath - English route path (e.g., 'login', 'register')
 * @param language - Target language
 * @param t - Translation function from i18next
 * @returns Translated route path
 */
export function getTranslatedRoute(
	englishPath: string,
	language: SupportedLanguage,
	t: (key: string) => string
): string {
	// If path is empty or root, return empty
	if (!englishPath || englishPath === '/') {
		return '';
	}

	// Remove leading slash if present
	const cleanPath = englishPath.startsWith('/') ? englishPath.slice(1) : englishPath;

	// Split path into segments
	const segments = cleanPath.split('/');

	// Translate each segment
	const translatedSegments = segments.map((segment) => {
		const routeKey = routeKeys[segment];
		if (routeKey) {
			return t(routeKey);
		}
		// If no translation found, return original segment
		return segment;
	});

	return translatedSegments.join('/');
}

/**
 * Get English route path from translated path
 * @param translatedPath - Translated route path (e.g., 'prihlasenie', 'registracia')
 * @param language - Current language
 * @param t - Translation function from i18next
 * @returns English route path
 */
export function getEnglishRoute(
	translatedPath: string,
	language: SupportedLanguage,
	t: (key: string) => string
): string {
	// If path is empty or root, return empty
	if (!translatedPath || translatedPath === '/') {
		return '';
	}

	// Remove leading slash if present
	const cleanPath = translatedPath.startsWith('/') ? translatedPath.slice(1) : translatedPath;

	// Split path into segments
	const segments = cleanPath.split('/');

	// Find English route for each segment
	const englishSegments = segments.map((segment) => {
		// Try to find which route key matches this translated segment
		for (const [routeKey, englishRoute] of Object.entries(routeKeyToEnglish)) {
			const translated = t(routeKey);
			if (translated === segment) {
				return englishRoute;
			}
		}
		// If no match found, return original segment
		return segment;
	});

	return englishSegments.join('/');
}

/**
 * Get all possible route translations for a given English route
 * Used for route matching
 */
export function getAllRouteTranslations(
	englishRoute: string,
	t: (key: string, options?: { lng?: string }) => string
): string[] {
	const slug = resolveRouteSlug(englishRoute);
	const routeKey = routeKeys[englishRoute] ?? routeKeys[slug];
	if (!routeKey) {
		return [slug];
	}

	const translations: string[] = [slug]; // Canonical English slug for React Router

	// Get translations for all supported languages
	const supportedLanguages: SupportedLanguage[] = ['en', 'sk', 'cz'];
	supportedLanguages.forEach((lang) => {
		const translated = t(routeKey, { lng: lang });
		if (translated !== slug && !translations.includes(translated)) {
			translations.push(translated);
		}
	});

	return translations;
}
