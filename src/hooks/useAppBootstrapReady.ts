import { useAuth } from '@/contexts/AuthContext';

export interface AppBootstrapError {
	message: string;
}

export interface AppBootstrapState {
	isReady: boolean;
	isBlocking: boolean;
	error: AppBootstrapError | null;
	flags: {
		i18nReady: boolean;
		authSessionReady: boolean;
		faceConfigReady: boolean;
	};
}

export function useAppBootstrapReady(): AppBootstrapState {
	const { isSessionHydrated } = useAuth();
	const authSessionReady = isSessionHydrated;
	const isReady = authSessionReady;

	return {
		isReady,
		isBlocking: !isReady,
		error: null,
		flags: {
			i18nReady: true,
			authSessionReady,
			faceConfigReady: true,
		},
	};
}
