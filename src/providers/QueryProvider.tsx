import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, type ReactNode } from 'react';

/** Loaded only in dev; excluded from production bundles via `import.meta.env.DEV`. */
const ReactQueryDevtools = lazy(() =>
	import('@tanstack/react-query-devtools').then((mod) => ({
		default: mod.ReactQueryDevtools,
	}))
);

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // drop inactive list data after 10 minutes (memory on long admin sessions)
		},
		mutations: {
			retry: 1,
		},
	},
});

interface QueryProviderProps {
	children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{import.meta.env.DEV ? (
				<Suspense fallback={null}>
					<ReactQueryDevtools initialIsOpen={false} />
				</Suspense>
			) : null}
		</QueryClientProvider>
	);
}
