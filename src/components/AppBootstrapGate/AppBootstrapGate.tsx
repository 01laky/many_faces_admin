import type { ReactNode } from 'react';
import { useAppBootstrapReady } from '@/hooks/useAppBootstrapReady';
import { GlobalAppPreloader } from '@/components/GlobalAppPreloader';

export function AppBootstrapGate({ children }: { children: ReactNode }) {
	const state = useAppBootstrapReady();

	if (!state.isReady) {
		return <GlobalAppPreloader />;
	}

	return children;
}
