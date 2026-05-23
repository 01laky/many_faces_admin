import type { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

/** DRY wrapper for authenticated admin pages inside AdminLayout. */
export function protectedLayoutRoute(
	withLayout: (page: ReactNode) => ReactNode,
	page: ReactNode,
	redirectTo = 'login'
): ReactNode {
	return <ProtectedRoute redirectTo={redirectTo}>{withLayout(page)}</ProtectedRoute>;
}
