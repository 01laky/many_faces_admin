import { describe, expect, it } from 'vitest';
import type { AppContextType, AuthContextType, AuthProviderProps, AuthUser } from './types';

describe('context colocated types (§2.13)', () => {
	it('AuthUser allows optional profile fields', () => {
		const minimal: AuthUser = { id: '1', email: 'a@demo.com' };
		const full: AuthUser = {
			id: '2',
			email: 'b@demo.com',
			firstName: 'Bo',
			lastName: 'Admin',
		};
		expect(minimal.firstName).toBeUndefined();
		expect(full.lastName).toBe('Admin');
	});

	it('AuthProviderProps requires children', () => {
		const props: AuthProviderProps = { children: null };
		expect(props.children).toBeNull();
	});

	it('AuthContextType exposes session hydration flags', () => {
		const snapshot: Pick<
			AuthContextType,
			'isAuthenticated' | 'isLoading' | 'isSessionHydrated' | 'token'
		> = {
			isAuthenticated: false,
			isLoading: true,
			isSessionHydrated: false,
			token: null,
		};
		expect(snapshot.isSessionHydrated).toBe(false);
	});

	it('AppContextType changeLanguage accepts SupportedLanguage union at runtime boundary', () => {
		const calls: string[] = [];
		const ctx: Pick<AppContextType, 'changeLanguage' | 't'> = {
			changeLanguage: (lang) => {
				calls.push(lang);
			},
			t: (key) => key,
		};
		ctx.changeLanguage('en');
		ctx.changeLanguage('sk');
		expect(calls).toEqual(['en', 'sk']);
	});
});
