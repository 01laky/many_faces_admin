import { GlobalAppPreloader } from '@/components/GlobalAppPreloader';

/** Minimal shell while lazy admin route chunks load. */
export function RouteLoadingFallback() {
	return <GlobalAppPreloader variant="route-fallback" accessibilityLabel="Loading page" />;
}
