import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';
import { useLocalizedLink } from '../hooks/useLocalizedLink';

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
	const { isAuthenticated, isLoading } = useAuth();
	const location = useLocation();
	const getLocalizedPath = useLocalizedLink();

	// Show loading state while checking authentication
	if (isLoading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
				}}
			>
				<div>Loading...</div>
			</div>
		);
	}

	// Redirect to login (or specified route) if not authenticated
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
