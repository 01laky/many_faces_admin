import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocalizedLink } from '../hooks/useLocalizedLink';

interface GuestRouteProps {
	children: React.ReactNode;
}

/**
 * GuestRoute - Redirects authenticated users to homepage
 * Used for routes that should only be accessible to unauthenticated users (login, register, home)
 */
export function GuestRoute({ children }: GuestRouteProps) {
	const { isAuthenticated, isLoading } = useAuth();
	const getLocalizedPath = useLocalizedLink();

	// Show nothing while checking authentication
	if (isLoading) {
		return null;
	}

	// If user is authenticated, redirect to dashboard
	if (isAuthenticated) {
		return <Navigate to={getLocalizedPath('/dashboard')} replace />;
	}

	// If user is not authenticated, show the route
	return <>{children}</>;
}
