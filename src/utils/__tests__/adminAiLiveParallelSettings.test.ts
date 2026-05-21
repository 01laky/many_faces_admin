import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	adminAiLiveParallelDefaults,
	clampLiveParallelBundleCalls,
	getAdminAiLiveMaxParallelBundleCalls,
	setAdminAiLiveMaxParallelBundleCalls,
} from '../adminAiLiveParallelSettings';

describe('adminAiLiveParallelSettings', () => {
	const store: Record<string, string> = {};

	beforeEach(() => {
		for (const k of Object.keys(store)) delete store[k];
		vi.stubGlobal('localStorage', {
			getItem: (k: string) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
			setItem: (k: string, v: string) => {
				store[k] = v;
			},
			removeItem: (k: string) => {
				delete store[k];
			},
			clear: () => {
				for (const k of Object.keys(store)) delete store[k];
			},
			key: () => null,
			length: 0,
		} as Storage);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('defaults to 2 when missing', () => {
		expect(getAdminAiLiveMaxParallelBundleCalls()).toBe(2);
	});

	it('round-trips valid value', () => {
		setAdminAiLiveMaxParallelBundleCalls(4);
		expect(getAdminAiLiveMaxParallelBundleCalls()).toBe(4);
	});

	it('clamps above max', () => {
		setAdminAiLiveMaxParallelBundleCalls(99);
		expect(getAdminAiLiveMaxParallelBundleCalls()).toBe(adminAiLiveParallelDefaults.MAX);
	});

	it('falls back on invalid string', () => {
		store[adminAiLiveParallelDefaults.STORAGE_KEY] = 'abc';
		expect(getAdminAiLiveMaxParallelBundleCalls()).toBe(2);
	});

	it('clampLiveParallelBundleCalls respects min and max', () => {
		expect(clampLiveParallelBundleCalls(0)).toBe(1);
		expect(clampLiveParallelBundleCalls(12)).toBe(8);
		expect(clampLiveParallelBundleCalls(4)).toBe(4);
	});
});
