import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	getAdminAiPublicStatsMode,
	setAdminAiPublicStatsMode,
	type AdminAiPublicStatsMode,
} from '../adminAiStatsSettings';

const KEY = 'admin_ai_public_stats_mode';

describe('adminAiStatsSettings', () => {
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

	it('defaults to inline when storage is empty', () => {
		expect(getAdminAiPublicStatsMode()).toBe('inline');
	});

	it.each(['inline', 'live'] as const)('round-trips mode %s', (mode: AdminAiPublicStatsMode) => {
		setAdminAiPublicStatsMode(mode);
		expect(getAdminAiPublicStatsMode()).toBe(mode);
	});

	it('treats unknown values as inline (safe default)', () => {
		store[KEY] = 'banana';
		expect(getAdminAiPublicStatsMode()).toBe('inline');
	});

	it('treats case-insensitive valid tokens', () => {
		store[KEY] = 'INLINE';
		expect(getAdminAiPublicStatsMode()).toBe('inline');
	});

	it('survives setItem throwing (quota)', () => {
		const ls = globalThis.localStorage as Storage;
		const spy = vi.spyOn(ls, 'setItem').mockImplementation(() => {
			throw new Error('quota');
		});
		expect(() => setAdminAiPublicStatsMode('live')).not.toThrow();
		spy.mockRestore();
	});

	it('getAdminAiPublicStatsMode returns inline when getItem throws', () => {
		const ls = globalThis.localStorage as Storage;
		const spy = vi.spyOn(ls, 'getItem').mockImplementation(() => {
			throw new Error('denied');
		});
		expect(getAdminAiPublicStatsMode()).toBe('inline');
		spy.mockRestore();
	});
});
