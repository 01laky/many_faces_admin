import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllRouteTranslations } from '@/utils/routeTranslations';

const ROUTE_IDS = [
	'login',
	'dashboard',
	'homepage',
	'users',
	'faces',
	'moderation',
	'chat',
	'userChat',
	'settings',
] as const;

export type AdminRouteId = (typeof ROUTE_IDS)[number];

export type AdminRoutePaths = Record<AdminRouteId, string[]>;

/** Memoized translated path lists per `i18n.language` — avoids rebuilding on unrelated re-renders. */
export function useAdminRoutePaths(): AdminRoutePaths {
	const { i18n } = useTranslation('common');
	return useMemo(() => {
		const translate = (key: string, options?: { lng?: string }) =>
			i18n.t(key, { lng: options?.lng || 'en' });
		const paths = {} as AdminRoutePaths;
		for (const id of ROUTE_IDS) {
			paths[id] = getAllRouteTranslations(id, translate);
		}
		return paths;
	}, [i18n]);
}
