import { describe, expect, it } from 'vitest';
import { isKnownOperatorAiHubErrorCode, mapOperatorAiHubError } from '../operatorAiHubErrors';

const t = (key: string) => key;

describe('operatorAiHubErrors', () => {
	const codes = [
		'invalid_locale',
		'not_operator',
		'conversation_not_found',
		'message_too_long',
		'rate_limited',
		'model_loading',
		'ai_unavailable',
		'ai_generation_failed',
		'ai_guard_rejected',
		'ai_disabled',
	] as const;

	it.each(codes)('maps known code %s', (code) => {
		expect(isKnownOperatorAiHubErrorCode(code)).toBe(true);
		expect(mapOperatorAiHubError(t, code)).toBe(`pages.chat.hub.errors.${code}`);
	});

	it('returns empty for unknown code', () => {
		expect(mapOperatorAiHubError(t, 'unknown_code')).toBe('');
	});
});
