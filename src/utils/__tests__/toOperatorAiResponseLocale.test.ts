import { toOperatorAiResponseLocale } from '@/utils/toOperatorAiResponseLocale';

describe('toOperatorAiResponseLocale', () => {
	it('passes through AI-supported UI locales', () => {
		expect(toOperatorAiResponseLocale('en')).toBe('en');
		expect(toOperatorAiResponseLocale('sk')).toBe('sk');
		expect(toOperatorAiResponseLocale('cz')).toBe('cz');
		expect(toOperatorAiResponseLocale('EN-US')).toBe('en');
	});

	it('maps de, fr, and it UI locales to English for AI', () => {
		expect(toOperatorAiResponseLocale('de')).toBe('en');
		expect(toOperatorAiResponseLocale('fr-FR')).toBe('en');
		expect(toOperatorAiResponseLocale('it')).toBe('en');
	});
});
