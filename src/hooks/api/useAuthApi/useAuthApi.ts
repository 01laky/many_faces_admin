import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { logger } from '../../../utils/logger';
import { meCapabilitiesKeys } from '../useMeCapabilities';
import {
	registerUser,
	runPasswordGrantLogin,
	readAuthTokenQueryValue,
	clearLocalAuthSession,
	runRefreshGrantLogin,
} from '../authSessionActions';

/**
 * Admin SPA auth hooks — same architecture as `many_faces_portal/src/hooks/api/useAuthApi.ts`:
 * OAuth2 password + refresh flows live in `authSessionActions`, while this file wires them into
 * TanStack Query (`setQueryData`, `invalidateQueries`, `removeQueries`).
 */

/** Root auth segment for React Query; pairs with `meCapabilitiesKeys` for ACL-driven UI. */
export const authKeys = {
	all: ['auth'] as const,
	user: () => [...authKeys.all, 'user'] as const,
	token: () => [...authKeys.all, 'token'] as const,
};

/** Domain cache roots cleared on logout / session expiry (REQ-SECURITY-CACHE). */
const DOMAIN_QUERY_ROOTS = [
	['users'],
	['faces'],
	['face'],
	['pages'],
	['page'],
	['stats'],
	['contentModeration'],
	['operatorAi'],
	['operatorUserChat'],
	['wallTickets'],
	['pageRouteTranslations'],
	['pageTypes'],
	['publicStats'],
	// Per-face operator content caches — must also be wiped on logout so a different
	// operator session cannot read the previous one's tenant data from React Query (REQ-SECURITY-CACHE).
	['faceProfiles'],
	['faceChatRooms'],
	['faceVideoLounges'],
	['stories'],
	['reels'],
	['blogs'],
	['albums'],
] as const;

/** Clears auth, capabilities, and operator domain React Query cache (admin + portal parity on auth keys). */
export function clearAuthAndCapabilitiesQueries(queryClient: QueryClient): void {
	queryClient.removeQueries({ queryKey: authKeys.all });
	queryClient.removeQueries({ queryKey: meCapabilitiesKeys.all });
	for (const key of DOMAIN_QUERY_ROOTS) {
		queryClient.removeQueries({ queryKey: key });
	}
}

/**
 * Hook for user registration
 */
export function useRegister() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: registerUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
			logger.info('User registered successfully');
		},
		onError: (error) => {
			logger.error('Registration failed', error);
		},
	});
}

/**
 * Hook for user login (OAuth2 token request)
 */
export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (credentials: { username: string; password: string; rememberMe?: boolean }) =>
			runPasswordGrantLogin(credentials),
		onSuccess: (data) => {
			queryClient.setQueryData(authKeys.token(), data);
			queryClient.invalidateQueries({ queryKey: authKeys.user() });
			queryClient.invalidateQueries({ queryKey: meCapabilitiesKeys.all });
			logger.info('Login successful');
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : 'Login failed';
			logger.error('Login failed', { error: errorMessage, originalError: error });
		},
	});
}

/**
 * Hook to get current auth token
 */
export function useAuthToken() {
	return useQuery({
		queryKey: authKeys.token(),
		queryFn: () => readAuthTokenQueryValue(),
		/** Re-read storage periodically so expiry discovered in another tab/process converges within ~1 min. */
		staleTime: 60_000,
	});
}

/**
 * Hook for logout
 */
export function useLogout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			clearLocalAuthSession();
		},
		onSuccess: () => {
			clearAuthAndCapabilitiesQueries(queryClient);
		},
	});
}

/**
 * Hook for refreshing auth token
 */
export function useRefreshToken() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => runRefreshGrantLogin(),
		onSuccess: (data) => {
			queryClient.setQueryData(authKeys.token(), data);
			queryClient.invalidateQueries({ queryKey: meCapabilitiesKeys.all });
			logger.info('Token refreshed successfully');
		},
		onError: (error) => {
			logger.error('Token refresh failed', error);
			clearAuthAndCapabilitiesQueries(queryClient);
		},
	});
}
