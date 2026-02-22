import { describe, it, expect, vi } from 'vitest';
import { getTranslatedRoute, getEnglishRoute, getAllRouteTranslations } from '../routeTranslations';

describe('routeTranslations', () => {
	const mockT = vi.fn((key: string, options?: { lng?: string }) => {
		const translations: Record<string, Record<string, string>> = {
			en: {
				'routes.login': 'login',
				'routes.homepage': 'homepage',
			},
			sk: {
				'routes.login': 'prihlasenie',
				'routes.homepage': 'domov',
			},
			cz: {
				'routes.login': 'prihlaseni',
				'routes.homepage': 'domov',
			},
		};

		const lang = options?.lng || 'en';
		return translations[lang]?.[key] || key;
	});

	describe('getTranslatedRoute', () => {
		it('should translate login route to Slovak', () => {
			const result = getTranslatedRoute('login', 'sk', (key: string) => mockT(key, { lng: 'sk' }));
			expect(result).toBe('prihlasenie');
		});

		it('should return English route if translation not found', () => {
			const result = getTranslatedRoute('unknown', 'sk', mockT);
			expect(result).toBe('unknown');
		});

		it('should handle empty path', () => {
			const result = getTranslatedRoute('', 'sk', mockT);
			expect(result).toBe('');
		});
	});

	describe('getEnglishRoute', () => {
		it('should convert Slovak login route to English', () => {
			// getEnglishRoute searches through all languages by calling t() for each language
			// It compares the translated value with the input segment
			const result = getEnglishRoute('prihlasenie', 'sk', (key: string) => {
				// This simulates how getEnglishRoute calls t() - it tries all languages
				if (key === 'routes.login') {
					// When checking Slovak, it should match 'prihlasenie'
					return 'prihlasenie';
				}
				return key;
			});
			expect(result).toBe('login');
		});

		it('should convert Czech homepage route to English', () => {
			const result = getEnglishRoute('domov', 'cz', (key: string) => {
				if (key === 'routes.homepage') {
					return 'domov';
				}
				return key;
			});
			expect(result).toBe('homepage');
		});

		it('should return original path if no translation found', () => {
			const result = getEnglishRoute('unknown', 'sk', mockT);
			expect(result).toBe('unknown');
		});

		it('should handle empty path', () => {
			const result = getEnglishRoute('', 'sk', mockT);
			expect(result).toBe('');
		});
	});

	describe('getAllRouteTranslations', () => {
		it('should return all translations for login route', () => {
			const result = getAllRouteTranslations('login', mockT);
			expect(result).toContain('login');
			expect(result).toContain('prihlasenie');
			expect(result).toContain('prihlaseni');
		});

		it('should return original route if translation not found', () => {
			const result = getAllRouteTranslations('unknown', mockT);
			expect(result).toEqual(['unknown']);
		});
	});
});
