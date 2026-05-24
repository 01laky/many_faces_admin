import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';

/**
 * ProtectedRoute component - requires authentication to access
 * Redirects to login page (or specified route) if user is not authenticated
 */
export function ProtectedRoute({
	children,
	redirectTo = 'login',
}: {
	children: ReactNode;
	redirectTo?: string;
}) {
	const { isAuthenticated } = useAuth();
	const location = useLocation();
	const getLocalizedPath = useLocalizedLink();

	if (!isAuthenticated) {
		// Save the attempted location to redirect back after login
		const currentPath = location.pathname;
		return (
			<Navigate to={getLocalizedPath(`/${redirectTo}`)} state={{ from: currentPath }} replace />
		);
	}

	// User is authenticated, render the protected content
	return <>{children}</>;
}
