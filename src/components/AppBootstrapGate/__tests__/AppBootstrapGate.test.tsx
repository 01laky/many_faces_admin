// @vitest-environment happy-dom
/**
 * GPL-9 (global app preloader, admin): the operator SPA bootstrap gate must block the
 * route tree behind exactly one full-viewport preloader until the *admin* session
 * hydrate finishes, and must never re-cover the app afterwards.
 *
 * Admin readiness differs from the portal: there is no faces config (no tenant grid in
 * the operator SPA), so the only blocking input is `AuthContext.isSessionHydrated`.
 * That latch is set in the `finally` of the bootstrap effect, i.e. *after*
 * `assertAdminAppAccessAllowed` — which performs `GET /api/me/capabilities` — settles.
 * These tests therefore drive the real `AuthProvider` with only its I/O leaves mocked,
 * so the gate is measured against the actual capabilities round trip.
 *
 * Pipeline position: `App.tsx` renders `AppProvider > AuthProvider > AppBootstrapGate >
 * BrowserRouter > AppRoutes`. The tree below mirrors that wiring with the real
 * `ProtectedRoute` standing in for `AppRoutes`, so a resurrected `isLoading` loading
 * branch in the route guards is caught as a duplicate loading shell.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppBootstrapGate } from '@/components/AppBootstrapGate';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const STORED_TOKEN = 'stored-admin-token';

const assertAdminAppAccessAllowedMock = vi.fn();
const loginMutateAsyncMock = vi.fn();

vi.mock('@/utils/adminAppAccess', () => ({
	assertAdminAppAccessAllowed: (token: string | null | undefined) =>
		assertAdminAppAccessAllowedMock(token),
	forcePlatformAccessDeniedLogout: vi.fn(),
}));

vi.mock('@/utils/authStorage', () => ({
	clearAuthStorage: vi.fn(),
	getAccessTokenFromStorage: () => STORED_TOKEN,
	getStoredUserJson: () => null,
	persistStoredUserJson: vi.fn(),
}));

vi.mock('@/utils/authSessionSync', () => ({
	setupAuthStorageSync: () => () => {},
}));

vi.mock('@/utils/jwtUtils', () => ({
	isTokenExpired: () => false,
}));

vi.mock('@/api/config', () => ({
	setAuthToken: vi.fn(),
}));

vi.mock('@/hooks/api/useAuthApi', () => ({
	useLogin: () => ({ mutateAsync: (...args: unknown[]) => loginMutateAsyncMock(...args) }),
	useLogout: () => ({ mutateAsync: vi.fn() }),
	useRefreshToken: () => ({ mutateAsync: vi.fn() }),
	useAuthToken: () => ({ data: { accessToken: STORED_TOKEN }, isLoading: false }),
	clearAuthAndCapabilitiesQueries: vi.fn(),
}));

vi.mock('@/hooks/api/useMeCapabilities', () => ({
	useMeCapabilities: () => ({ data: undefined, isLoading: false }),
}));

vi.mock('@/hooks/useLocalizedLink', () => ({
	useLocalizedLink: () => (path: string) => `/en${path}`,
}));

/** Minimal promise handle so a test can hold the capabilities check open. */
function createDeferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((res) => {
		resolve = res;
	});
	return { promise, resolve };
}

/** Any full-viewport bootstrap loader currently mounted (gate preloader or legacy shells). */
function fullScreenLoaderCount(): number {
	return (
		screen.queryAllByTestId('global-app-preloader').length +
		// Legacy `ProtectedRoute` / `GuestRoute` 100vh "Loading..." block, removed by the gate.
		screen.queryAllByText(/^Loading\.\.\.$/).length +
		// Legacy pre-React `bootstrapShell` caption.
		screen.queryAllByText(/Loading translations/i).length
	);
}

/** Calls `login()` from the real `AuthContext` so `isLoading` toggles like production. */
function LoginTrigger() {
	const { login } = useAuth();
	return (
		<button
			type="button"
			data-testid="login-trigger"
			onClick={() => {
				void login('operator', 'secret').catch(() => {});
			}}
		>
			login
		</button>
	);
}

/** Gate + real route guard exactly as `App.tsx` wires them, with a stub page leaf. */
function bootstrapTree() {
	return (
		<QueryClientProvider client={new QueryClient()}>
			<MemoryRouter initialEntries={['/en/dashboard']}>
				<AuthProvider>
					<AppBootstrapGate>
						<ProtectedRoute>
							<div data-testid="admin-content">dashboard</div>
							<LoginTrigger />
						</ProtectedRoute>
					</AppBootstrapGate>
				</AuthProvider>
			</MemoryRouter>
		</QueryClientProvider>
	);
}

describe('AppBootstrapGate GPL', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('GPL-9: blocks the route tree behind one preloader until the admin session hydrate resolves', async () => {
		// The capabilities check stays in flight, so `isSessionHydrated` cannot latch yet.
		const access = createDeferred<boolean>();
		assertAdminAppAccessAllowedMock.mockReturnValue(access.promise);

		render(bootstrapTree());
		await act(async () => {});

		// Bootstrap still blocking: exactly one full-viewport loader, no route content.
		expect(fullScreenLoaderCount()).toBe(1);
		const preloader = screen.getByTestId('global-app-preloader');
		expect(preloader.className).toContain('global-app-preloader--bootstrap');
		expect(preloader.getAttribute('role')).toBe('status');
		expect(preloader.getAttribute('aria-busy')).toBe('true');
		expect(screen.queryByTestId('admin-content')).toBeNull();

		await act(async () => {
			access.resolve(true);
		});

		// Gate open: the protected page renders and no loader survives behind it.
		expect(screen.getByTestId('admin-content')).toBeTruthy();
		expect(fullScreenLoaderCount()).toBe(0);
		expect(screen.queryAllByRole('status')).toHaveLength(0);
	});

	it('GPL-9: the gate waits for the assertAdminAppAccessAllowed capabilities round trip', async () => {
		const access = createDeferred<boolean>();
		assertAdminAppAccessAllowedMock.mockReturnValue(access.promise);

		render(bootstrapTree());
		await act(async () => {});

		// The stored token is checked against server capabilities before the gate may open.
		expect(assertAdminAppAccessAllowedMock).toHaveBeenCalledWith(STORED_TOKEN);
		expect(screen.getByTestId('global-app-preloader')).toBeTruthy();

		// Access denied still hydrates the session (latch lives in `finally`): the gate opens
		// and the route guard redirects — never an infinite preloader (§4).
		await act(async () => {
			access.resolve(false);
		});

		expect(fullScreenLoaderCount()).toBe(0);
	});

	it('GPL-9: a login after the gate opened does not re-cover the app with the preloader', async () => {
		assertAdminAppAccessAllowedMock.mockResolvedValue(true);
		const loginRequest = createDeferred<{ accessToken: string }>();
		loginMutateAsyncMock.mockReturnValue(loginRequest.promise);

		render(bootstrapTree());
		await act(async () => {});
		expect(screen.getByTestId('admin-content')).toBeTruthy();

		// `login()` sets `AuthContext.isLoading` back to true; the hydrate latch must not follow.
		await act(async () => {
			screen.getByTestId('login-trigger').click();
		});

		expect(fullScreenLoaderCount()).toBe(0);
		expect(screen.getByTestId('admin-content')).toBeTruthy();

		await act(async () => {
			loginRequest.resolve({ accessToken: STORED_TOKEN });
		});

		expect(fullScreenLoaderCount()).toBe(0);
	});
});
