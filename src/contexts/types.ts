import type { ReactNode } from 'react';
import type { SupportedLanguage } from '@/i18n/config';

export interface AppContextType {
	currentLanguage: SupportedLanguage;
	changeLanguage: (lang: SupportedLanguage) => void;
	t: (key: string, options?: Record<string, unknown>) => string;
}

export interface AppProviderProps {
	children: ReactNode;
}

export interface AuthUser {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
}

export interface AuthContextType {
	isAuthenticated: boolean;
	isLoading: boolean;
	isSessionHydrated: boolean;
	user: AuthUser | null;
	token: string | null;
	login: (username: string, password: string, options?: { rememberMe?: boolean }) => Promise<void>;
	logout: () => Promise<void>;
	refreshAuth: () => Promise<void>;
}

export interface AuthProviderProps {
	children: ReactNode;
}

export interface MeCapabilitiesWarmupProps {
	token: string | null;
}
