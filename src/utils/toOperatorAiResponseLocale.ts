/** Locales the operator AI worker can reply in (UI may expose more languages). */
export type OperatorAiResponseLocale = 'en' | 'sk' | 'cz';

const OPERATOR_AI_RESPONSE_LOCALES = new Set<string>(['en', 'sk', 'cz']);

/**
 * Map admin UI language to an AI-supported response locale.
 * German, French, and Italian UI copy falls back to English for AI replies.
 */
export function toOperatorAiResponseLocale(uiLocale: string): OperatorAiResponseLocale {
	const code = uiLocale.trim().toLowerCase().split(/[-_]/)[0] ?? '';
	if (OPERATOR_AI_RESPONSE_LOCALES.has(code)) {
		return code as OperatorAiResponseLocale;
	}
	return 'en';
}
