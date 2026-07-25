import { describe, expect, it } from 'vitest';
import { getAllRouteTranslations, getTranslatedRoute } from '../routeTranslations';

describe('routeTranslations', () => {
	const t = (key: string, options?: { lng?: string }) => {
		const lng = options?.lng ?? 'en';
		const map: Record<string, Record<string, string>> = {
			'routes.userChat': { en: 'user-chat', sk: 'chat-pouzivatelia', cz: 'chat-uzivatele' },
		};
		return map[key]?.[lng] ?? key;
	};

	it('registers user-chat slug for userChat route id', () => {
		const paths = getAllRouteTranslations('userChat', t);
		expect(paths).toContain('user-chat');
		expect(paths).toContain('chat-pouzivatelia');
		expect(paths).not.toContain('userChat');
	});

	it('translates /user-chat path segment for Slovak', () => {
		expect(getTranslatedRoute('user-chat', (key) => t(key, { lng: 'sk' }))).toBe(
			'chat-pouzivatelia'
		);
	});
});
