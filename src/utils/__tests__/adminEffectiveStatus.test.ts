import { describe, it, expect } from 'vitest';
import {
	resolveEffectiveStatusBadge,
	resolveEffectiveStatusModifier,
} from '../adminEffectiveStatus';

describe('resolveEffectiveStatusBadge', () => {
	it('maps known backend statuses (case-insensitive)', () => {
		expect(resolveEffectiveStatusBadge('Disabled')).toBe('disabled');
		expect(resolveEffectiveStatusBadge('incomplete')).toBe('incomplete');
		expect(resolveEffectiveStatusBadge('CONFIGURED')).toBe('configured');
	});

	it('falls back to the configured flag for unknown/undefined status', () => {
		expect(resolveEffectiveStatusBadge(undefined, true)).toBe('configured');
		expect(resolveEffectiveStatusBadge('something-else', false)).toBe('notConfigured');
		expect(resolveEffectiveStatusBadge(undefined)).toBe('notConfigured');
	});
});

describe('resolveEffectiveStatusModifier', () => {
	it('returns off for disabled, ok for configured', () => {
		expect(resolveEffectiveStatusModifier('disabled')).toBe('off');
		expect(resolveEffectiveStatusModifier('configured')).toBe('ok');
	});

	it('returns warn for degraded/incomplete/unreachable, unknown, or a failed last test', () => {
		expect(resolveEffectiveStatusModifier('incomplete')).toBe('warn');
		expect(resolveEffectiveStatusModifier('degraded')).toBe('warn');
		expect(resolveEffectiveStatusModifier('unreachable')).toBe('warn');
		expect(resolveEffectiveStatusModifier('mystery')).toBe('warn');
		expect(
			resolveEffectiveStatusModifier('configured', {
				lastTest: { kind: 'failure', at: new Date(), message: 'x' },
			})
		).toBe('warn');
	});
});
