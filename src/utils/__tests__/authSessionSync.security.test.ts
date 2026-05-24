import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AUTH_STORAGE_KEYS } from '../authStorage';
import { setupAuthStorageSync } from '../authSessionSync';

describe('authSessionSync (ASH1-T-A15)', () => {
	const handlers: Record<string, Array<(event: StorageEvent) => void>> = {};

	beforeEach(() => {
		handlers.storage = [];
		vi.stubGlobal('window', {
			addEventListener: (type: string, fn: (event: StorageEvent) => void) => {
				handlers[type] = handlers[type] ?? [];
				handlers[type].push(fn);
			},
			removeEventListener: (type: string, fn: (event: StorageEvent) => void) => {
				handlers[type] = (handlers[type] ?? []).filter((h) => h !== fn);
			},
		});
	});

	it('storage event clearing auth_token triggers callback', () => {
		const onCleared = vi.fn();
		setupAuthStorageSync(onCleared);

		const event = {
			key: AUTH_STORAGE_KEYS.TOKEN,
			oldValue: 'jwt',
			newValue: null,
		} as StorageEvent;

		for (const handler of handlers.storage ?? []) {
			handler(event);
		}

		expect(onCleared).toHaveBeenCalledOnce();
	});
});
