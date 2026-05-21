import { describe, expect, it } from 'vitest';
import {
	adminAiLiveParallelDefaults,
	clampLiveParallelBundleCalls,
	normalizeLiveParallelBundleCalls,
} from '../adminAiLiveParallelSettings';

describe('adminAiLiveParallelSettings', () => {
	it('defaults to 2 when value is missing', () => {
		expect(normalizeLiveParallelBundleCalls(undefined)).toBe(2);
	});

	it('round-trips valid values', () => {
		expect(normalizeLiveParallelBundleCalls(4)).toBe(4);
	});

	it('clamps above max', () => {
		expect(clampLiveParallelBundleCalls(99)).toBe(adminAiLiveParallelDefaults.MAX);
	});

	it('clamps below min', () => {
		expect(clampLiveParallelBundleCalls(0)).toBe(adminAiLiveParallelDefaults.MIN);
	});

	it('falls back when value is not finite', () => {
		expect(normalizeLiveParallelBundleCalls(Number.NaN, 3)).toBe(3);
	});
});
