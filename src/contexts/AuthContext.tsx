import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { setAuthToken } from '../api/config';
import { logger } from '../utils/logger';
import { isTokenExpired } from '../utils/jwtUtils';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
	useLogin as useLoginMutation,
	useLogout as useLogoutMutation,
	useAuthToken,
	useRefreshToken as useRefreshTokenMutation,
	clearAuthAndCapabilitiesQueries,
} from '../hooks/api/useAuthApi';
import { useMeCapabilities } from '../hooks/api/useMeCapabilities';
import { assertAdminAppAccessAllowed } from '../utils/adminAppAccess';
import {
	clearAuthStorage,
	getAccessTokenFromStorage,
	getStoredUserJson,
	persistStoredUserJson,
} from '../utils/authStorage';

/**
 * User information interface
 */
interface User {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
}

/**
 * Authentication context type
 */
interface AuthContextType {
	isAuthenticated: boolean;
	isLoading: boolean;
	isSessionHydrated: boolean;
	user: User | null;
	token: string | null;
	login: (username: string, password: string, options?: { rememberMe?: boolean }) => Promise<void>;
	logout: () => Promise<void>;
	refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function MeCapabilitiesWarmup({ token }: { token: string | null }) {
	useMeCapabilities(token, Boolean(token));
	return null;
}

function resetLocalAuthState(
	queryClient: ReturnType<typeof useQueryClient>,
	setters: {
		setToken: (t: string | null) => void;
		setUser: (u: User | null) => void;
		setIsAuthenticated: (v: boolean) => void;
	}
): void {
	clearAuthStorage();
	clearAuthAndCapabilitiesQueries(queryClient);
	setters.setToken(null);
	setters.setUser(null);
	setters.setIsAuthenticated(false);
}

/**
 * Authentication Provider component
 * Manages authentication state and provides auth methods
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSessionHydrated, setIsSessionHydrated] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const { t } = useTranslation('common');
	const queryClient = useQueryClient();

	const loginMutation = useLoginMutation();
	const logoutMutation = useLogoutMutation();
	const refreshTokenMutation = useRefreshTokenMutation();
	const { data: tokenData, isLoading: tokenLoading } = useAuthToken();

	useEffect(() => {
		void (async () => {
			try {
				const storedToken = getAccessTokenFromStorage();
				const storedUser = getStoredUserJson();

				if (storedToken && !isTokenExpired(storedToken)) {
					const allowed = await assertAdminAppAccessAllowed(storedToken);
					if (!allowed) {
						resetLocalAuthState(queryClient, { setToken, setUser, setIsAuthenticated });
						return;
					}

					setToken(storedToken);
					setAuthToken(storedToken);
					setIsAuthenticated(true);

					if (storedUser) {
						try {
							setUser(JSON.parse(storedUser));
						} catch (e) {
							logger.warn('Failed to parse stored user data', { error: String(e) });
						}
					}
				} else if (storedToken && isTokenExpired(storedToken)) {
					clearAuthStorage();
					clearAuthAndCapabilitiesQueries(queryClient);
				}
			} catch (error) {
				logger.error('Failed to load auth state', error);
			} finally {
				setIsSessionHydrated(true);
				setIsLoading(false);
			}
		})();
	}, [queryClient]);

	useEffect(() => {
		void (async () => {
			await Promise.resolve();
			if (tokenData?.accessToken) {
				setToken(tokenData.accessToken);
				setAuthToken(tokenData.accessToken);
				setIsAuthenticated(true);
			} else if (!tokenLoading && !tokenData) {
				setToken(null);
				setAuthToken(null);
				setIsAuthenticated(false);
			}
		})();
	}, [tokenData, tokenLoading]);

	useEffect(() => {
		if (!token || !isAuthenticated) return;

		const checkExpiry = () => {
			if (token && isTokenExpired(token)) {
				resetLocalAuthState(queryClient, { setToken, setUser, setIsAuthenticated });
				toast.info(
					t('pages.logout.sessionExpired') || 'Your session has expired. Please log in again.'
				);
			}
		};

		const tick = () => {
			if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
			checkExpiry();
		};

		const interval = setInterval(tick, 30_000);
		const onVisibility = () => {
			if (typeof document !== 'undefined' && document.visibilityState === 'visible') tick();
		};
		document.addEventListener('visibilitychange', onVisibility);
		return () => {
			clearInterval(interval);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	}, [token, isAuthenticated, t, queryClient]);

	const login = useCallback(
		async (username: string, password: string, options?: { rememberMe?: boolean }) => {
			try {
				setIsLoading(true);
				logger.info('Attempting login', { username });

				const result = await loginMutation.mutateAsync({
					username,
					password,
					rememberMe: options?.rememberMe,
				});

				if (result?.accessToken) {
					const allowed = await assertAdminAppAccessAllowed(result.accessToken);
					if (!allowed) {
						resetLocalAuthState(queryClient, { setToken, setUser, setIsAuthenticated });
						throw new Error('PLATFORM_ACCESS_DENIED');
					}

					setToken(result.accessToken);
					setAuthToken(result.accessToken);
					setIsAuthenticated(true);

					try {
						const payload = JSON.parse(atob(result.accessToken.split('.')[1]));
						const userData: User = {
							id: payload.sub || payload.nameid || '',
							email: payload.email || username,
							firstName: payload.given_name || payload.firstName,
							lastName: payload.family_name || payload.lastName,
						};
						setUser(userData);
						persistStoredUserJson(JSON.stringify(userData));
					} catch (e) {
						logger.warn('Failed to decode token, using username as email', { error: String(e) });
						const userData: User = {
							id: username,
							email: username,
						};
						setUser(userData);
						persistStoredUserJson(JSON.stringify(userData));
					}

					logger.info('Login successful', { username });
				}
			} catch (error) {
				logger.error('Login failed', error);
				setIsAuthenticated(false);
				setToken(null);
				setUser(null);
				setAuthToken(null);
				throw error;
			} finally {
				setIsLoading(false);
			}
		},
		[loginMutation, queryClient]
	);

	const logout = useCallback(async () => {
		try {
			setIsLoading(true);
			logger.info('Logging out');
			await logoutMutation.mutateAsync();
			clearAuthStorage();
			setToken(null);
			setIsAuthenticated(false);
			setUser(null);
			logger.info('Logout successful');
			toast.success(t('pages.logout.successMessage') || 'Logged out successfully');
		} catch (error) {
			logger.error('Logout failed', error);
			clearAuthStorage();
			setToken(null);
			setIsAuthenticated(false);
			setUser(null);
			const errorMessage =
				error instanceof Error ? error.message : t('pages.logout.errorMessage') || 'Logout failed';
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}, [logoutMutation, t]);

	const refreshAuth = useCallback(async () => {
		try {
			const result = await refreshTokenMutation.mutateAsync();

			if (result?.accessToken) {
				const allowed = await assertAdminAppAccessAllowed(result.accessToken);
				if (!allowed) {
					resetLocalAuthState(queryClient, { setToken, setUser, setIsAuthenticated });
					throw new Error('PLATFORM_ACCESS_DENIED');
				}

				setToken(result.accessToken);
				setAuthToken(result.accessToken);
				setIsAuthenticated(true);
				logger.info('Token refreshed successfully');
			}
		} catch (error) {
			logger.error('Token refresh failed', error);
			if (error instanceof Error && error.message === 'PLATFORM_ACCESS_DENIED') {
				return;
			}
			await logout();
		}
	}, [refreshTokenMutation, logout, queryClient]);

	const authContextValue = useMemo(
		() => ({
			isAuthenticated,
			isLoading,
			isSessionHydrated,
			user,
			token,
			login,
			logout,
			refreshAuth,
		}),
		[isAuthenticated, isLoading, isSessionHydrated, user, token, login, logout, refreshAuth]
	);

	return (
		<AuthContext.Provider value={authContextValue}>
			<MeCapabilitiesWarmup token={token} />
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
