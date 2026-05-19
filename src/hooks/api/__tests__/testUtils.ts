import { QueryClient } from '@tanstack/react-query';

/** Vitest QueryClient — no retries, immediate GC. */
export function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0 },
			mutations: { retry: false },
		},
	});
}
