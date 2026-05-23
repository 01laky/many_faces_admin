import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
	AUTH_STORAGE_KEYS,
	clearAuthStorage,
	getAccessTokenFromStorage,
	getRefreshTokenFromStorage,
	getStoredUserJson,
	persistAccessToken,
	persistRefreshToken,
	persistStoredUserJson,
	resolveHubAccessToken,
	type AuthWebStorage,
} from '../authStorage';

function createMemoryStorage(initial: Record<string, string> = {}): AuthWebStorage {
	const map = new Map(Object.entries(initial));
	return {
		getItem: (key: string) => map.get(key) ?? null,
		setItem: (key: string, value: string) => {
			map.set(key, value);
		},
		removeItem: (key: string) => {
			map.delete(key);
		},
	};
}

describe('authStorage (REF-A1…A6)', () => {
	let storage: AuthWebStorage;
	const applyAuthToken = vi.fn();

	beforeEach(() => {
		storage = createMemoryStorage();
		applyAuthToken.mockClear();
	});

	it('REF-A1: getAccessTokenFromStorage returns null when missing', () => {
		expect(getAccessTokenFromStorage(storage)).toBeNull();
	});

	it('REF-A2: persistAccessToken writes storage and applies axios token', () => {
		persistAccessToken('jwt-abc', storage, applyAuthToken);
		expect(storage.getItem(AUTH_STORAGE_KEYS.TOKEN)).toBe('jwt-abc');
		expect(applyAuthToken).toHaveBeenCalledWith('jwt-abc');
	});

	it('REF-A3: clearAuthStorage removes all auth keys', () => {
		storage.setItem(AUTH_STORAGE_KEYS.TOKEN, 't');
		storage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, 'r');
		storage.setItem(AUTH_STORAGE_KEYS.USER, '{}');
		clearAuthStorage(storage, applyAuthToken);
		expect(getAccessTokenFromStorage(storage)).toBeNull();
		expect(getRefreshTokenFromStorage(storage)).toBeNull();
		expect(getStoredUserJson(storage)).toBeNull();
		expect(applyAuthToken).toHaveBeenCalledWith(null);
	});

	it('REF-A4: resolveHubAccessToken prefers in-memory ref', () => {
		storage.setItem(AUTH_STORAGE_KEYS.TOKEN, 'stored');
		expect(resolveHubAccessToken('live', storage)).toBe('live');
	});

	it('REF-A5: resolveHubAccessToken falls back to storage when ref empty', () => {
		storage.setItem(AUTH_STORAGE_KEYS.TOKEN, 'stored');
		expect(resolveHubAccessToken(null, storage)).toBe('stored');
	});

	it('REF-A6: persistRefreshToken and user json are isolated keys', () => {
		persistRefreshToken('refresh-1', storage);
		persistStoredUserJson('{"id":"1"}', storage);
		expect(getRefreshTokenFromStorage(storage)).toBe('refresh-1');
		expect(getStoredUserJson(storage)).toBe('{"id":"1"}');
		expect(getAccessTokenFromStorage(storage)).toBeNull();
	});
});
