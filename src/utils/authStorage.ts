import { setAuthToken } from '../api/config';

/** Browser localStorage keys for admin SPA auth (parity with portal). */
export const AUTH_STORAGE_KEYS = {
	TOKEN: 'auth_token',
	REFRESH_TOKEN: 'auth_refresh_token',
	USER: 'auth_user',
} as const;

export type AuthWebStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function getAccessTokenFromStorage(storage: AuthWebStorage = localStorage): string | null {
	return storage.getItem(AUTH_STORAGE_KEYS.TOKEN);
}

export function getRefreshTokenFromStorage(storage: AuthWebStorage = localStorage): string | null {
	return storage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
}

export function getStoredUserJson(storage: AuthWebStorage = localStorage): string | null {
	return storage.getItem(AUTH_STORAGE_KEYS.USER);
}

export function persistAccessToken(
	token: string,
	storage: AuthWebStorage = localStorage,
	applyAuthToken: (t: string | null) => void = setAuthToken
): void {
	applyAuthToken(token);
	storage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
}

export function persistRefreshToken(token: string, storage: AuthWebStorage = localStorage): void {
	storage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token);
}

export function persistStoredUserJson(json: string, storage: AuthWebStorage = localStorage): void {
	storage.setItem(AUTH_STORAGE_KEYS.USER, json);
}

/** Clears bearer header and all auth-related storage entries. */
export function clearAuthStorage(
	storage: AuthWebStorage = localStorage,
	applyAuthToken: (t: string | null) => void = setAuthToken
): void {
	applyAuthToken(null);
	storage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
	storage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
	storage.removeItem(AUTH_STORAGE_KEYS.USER);
}

/** SignalR hubs: prefer React ref, fall back to storage on reconnect. */
export function resolveHubAccessToken(
	inMemoryToken: string | null,
	storage: AuthWebStorage = localStorage
): string | null {
	return inMemoryToken ?? getAccessTokenFromStorage(storage);
}
