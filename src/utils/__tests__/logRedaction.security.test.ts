import { describe, expect, it } from 'vitest';
import { redactLogProperties, redactSensitiveLogText } from '../logRedaction';

describe('logRedaction (ASH1-F1)', () => {
	it('redacts access_token query params in messages', () => {
		expect(redactSensitiveLogText('hub?access_token=secret123&x=1')).toContain('[REDACTED]');
		expect(redactSensitiveLogText('hub?access_token=secret123&x=1')).not.toContain('secret123');
	});

	it('redacts sensitive property keys', () => {
		const out = redactLogProperties({ refreshToken: 'abc', user: 'ok' });
		expect(out?.refreshToken).toBe('[REDACTED]');
		expect(out?.user).toBe('ok');
	});
});
