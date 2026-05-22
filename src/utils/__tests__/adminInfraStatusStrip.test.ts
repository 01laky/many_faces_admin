import { describe, expect, it } from 'vitest';
import { resolveInfraConfiguredBadge, resolveInfraStatusModifier } from '../adminInfraStatusStrip';

describe('adminInfraStatusStrip helpers', () => {
	it('resolveInfraConfiguredBadge maps boolean flags', () => {
		expect(resolveInfraConfiguredBadge(true)).toBe('configured');
		expect(resolveInfraConfiguredBadge(false)).toBe('notConfigured');
		expect(resolveInfraConfiguredBadge(undefined)).toBe('notConfigured');
	});

	it('resolveInfraStatusModifier covers configured, warn, and off states', () => {
		expect(resolveInfraStatusModifier(false)).toBe('off');
		expect(resolveInfraStatusModifier(true, { deviceCount: 0 })).toBe('warn');
		expect(
			resolveInfraStatusModifier(true, {
				lastTest: { kind: 'failure', at: new Date(), message: 'x' },
			})
		).toBe('warn');
		expect(resolveInfraStatusModifier(true, { deviceCount: 2 })).toBe('ok');
	});
});
