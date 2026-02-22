/**
 * App.tsx - Main application component for Admin Demo
 *
 * This component sets up the React Router routing structure for the admin panel.
 * It handles:
 * - Language-based routing (e.g., /en/users, /sk/pouzivatelia, /cz/uzivatele)
 * - Protected routes (require authentication)
 * - Guest-only routes (redirect if authenticated)
 * - Admin-specific routes (users, faces, pages management)
 * - Conditional rendering of Sidebar and Header (only when authenticated)
 *
 * Routing structure:
 * - Root (/) redirects to default language
 * - /:lang routes handle language-specific paths
 * - Each route can have multiple translations
 * - Admin routes support CRUD operations (list, detail, create, edit)
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageRouter } from './components/LanguageRouter';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import { DashboardPage } from './pages/DashboardPage';
import { HomePageProtected } from './pages/HomePageProtected';
import { LoginPage } from './pages/LoginPage';
import { UsersPage } from './pages/UsersPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { CreateUserPage } from './pages/CreateUserPage';
import { EditUserPage } from './pages/EditUserPage';
import { FacesPage } from './pages/FacesPage';
import { FaceDetailPage } from './pages/FaceDetailPage';
import { CreateFacePage } from './pages/CreateFacePage';
import { EditFacePage } from './pages/EditFacePage';
import { CreatePagePage } from './pages/CreatePagePage';
import { EditPagePage } from './pages/EditPagePage';
import { PageDetailPage } from './pages/PageDetailPage';
import { logger } from './utils/logger';
import { supportedLanguages } from './i18n/config';
import { getAllRouteTranslations } from './utils/routeTranslations';
import i18n from './i18n/config';
import './styles/toast.scss';

/**
 * Helper function to get all translated route paths for a given English route
 *
 * This function retrieves all possible translations of a route name across all supported languages.
 * For example, 'users' returns ['users', 'pouzivatelia', 'uzivatele'] for en, sk, cz.
 *
 * @param englishRoute - The English route name (e.g., 'login', 'users', 'faces')
 * @returns Array of all translated route paths
 */
const getRoutePaths = (englishRoute: string): string[] => {
	return getAllRouteTranslations(englishRoute, (key: string, options?: { lng?: string }) => {
		return i18n.t(key, { lng: options?.lng || 'en' });
	});
};

/**
 * AppContent component - contains routing logic
 *
 * This component is separated from App to allow using useAuth hook
 * (hooks can only be used inside components, not at module level).
 *
 * Conditionally renders Sidebar and Header only when user is authenticated.
 */
function AppContent() {
	logger.info('App component mounted');

	// Get all possible translations for each route
	const loginPaths = getRoutePaths('login');
	const dashboardPaths = getRoutePaths('dashboard');
	const homepagePaths = getRoutePaths('homepage');
	const usersPaths = getRoutePaths('users');
	const facesPaths = getRoutePaths('faces');

	/**
	 * Wraps a page component with AdminLayout (sidebar + header) when authenticated.
	 * Login and guest pages are rendered without layout.
	 */
	const withLayout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;

	return (
		<>
			<Routes>
				{/* 
          Root path redirects to default language (first language in supportedLanguages array)
          Example: / -> /en
        */}
				<Route path="/" element={<Navigate to={`/${supportedLanguages[0]}`} replace />} />

				{/* 
          Language-based routes - all routes are prefixed with language code
          Example: /en/users, /sk/pouzivatelia, /cz/uzivatele
          LanguageRouter component handles language detection and validation
        */}
				<Route path="/:lang" element={<LanguageRouter />}>
					{/* Root route - redirect to dashboard if authenticated */}
					<Route
						index
						element={
							<ProtectedRoute redirectTo="login">
								<AdminLayout>
									<DashboardPage />
								</AdminLayout>
							</ProtectedRoute>
						}
					/>

					{/* Login route - guest only, no layout wrapper */}
					{loginPaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={
								<GuestRoute>
									<LoginPage />
								</GuestRoute>
							}
						/>
					))}

					{/* Dashboard route */}
					{dashboardPaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={
								<ProtectedRoute redirectTo="login">{withLayout(<DashboardPage />)}</ProtectedRoute>
							}
						/>
					))}

					{/* Homepage route (legacy, still accessible) */}
					{homepagePaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={
								<ProtectedRoute redirectTo="login">
									{withLayout(<HomePageProtected />)}
								</ProtectedRoute>
							}
						/>
					))}

					{usersPaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={
								<ProtectedRoute redirectTo="login">{withLayout(<UsersPage />)}</ProtectedRoute>
							}
						/>
					))}

					{usersPaths.map((path) => (
						<Route
							key={`${path}/:id`}
							path={`${path}/:id`}
							element={
								<ProtectedRoute redirectTo="login">{withLayout(<UserDetailPage />)}</ProtectedRoute>
							}
						/>
					))}

					{usersPaths.map((path) => (
						<Route
							key={`${path}/create`}
							path={`${path}/create`}
							element={
								<ProtectedRoute redirectTo="login">{withLayout(<CreateUserPage />)}</ProtectedRoute>
							}
						/>
					))}

					{usersPaths.map((path) => (
						<Route
							key={`${path}/:id/edit`}
							path={`${path}/:id/edit`}
							element={
								<ProtectedRoute redirectTo="login">{withLayout(<EditUserPage />)}</ProtectedRoute>
							}
						/>
					))}

					{facesPaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={
								<ProtectedRoute redirectTo="login">{withLayout(<FacesPage />)}</ProtectedRoute>
							}
						/>
					))}

					{facesPaths.map((path) => (
						<Route
							key={`${path}/:id`}
							path={`${path}/:id`}
							element={
								<ProtectedRoute redirectTo="login">{withLayout(<FaceDetailPage />)}</ProtectedRoute>
							}
						/>
					))}

					{facesPaths.map((path) => (
						<Route
							key={`${path}/create`}
							path={`${path}/create`}
							element={
								<ProtectedRoute redirectTo="login">{withLayout(<CreateFacePage />)}</ProtectedRoute>
							}
						/>
					))}

					{facesPaths.map((path) => (
						<Route
							key={`${path}/:id/edit`}
							path={`${path}/:id/edit`}
							element={
								<ProtectedRoute redirectTo="login">{withLayout(<EditFacePage />)}</ProtectedRoute>
							}
						/>
					))}

					{facesPaths.map((path) => (
						<Route
							key={`${path}/:faceId/pages/create`}
							path={`${path}/:faceId/pages/create`}
							element={
								<ProtectedRoute redirectTo="login">{withLayout(<CreatePagePage />)}</ProtectedRoute>
							}
						/>
					))}

					<Route
						path="pages/:id"
						element={
							<ProtectedRoute redirectTo="login">{withLayout(<PageDetailPage />)}</ProtectedRoute>
						}
					/>

					<Route
						path="pages/:id/edit"
						element={
							<ProtectedRoute redirectTo="login">{withLayout(<EditPagePage />)}</ProtectedRoute>
						}
					/>

					{/* 
            Catch-all route for invalid paths within language context
            Redirects to parent route (language root)
            Example: /en/invalid-path -> /en
          */}
					<Route path="*" element={<Navigate to=".." replace />} />
				</Route>

				{/* 
          Global catch-all route - redirects any invalid path to default language
          Example: /invalid-path -> /en
        */}
				<Route path="*" element={<Navigate to={`/${supportedLanguages[0]}`} replace />} />
			</Routes>
		</>
	);
}

function App() {
	return (
		<AppProvider>
			<AuthProvider>
				<BrowserRouter>
					<AppContent />
					<ToastContainer
						position="top-center"
						autoClose={5000}
						hideProgressBar={false}
						newestOnTop={false}
						closeOnClick
						rtl={false}
						pauseOnFocusLoss
						draggable
						pauseOnHover
						theme="light"
					/>
				</BrowserRouter>
			</AuthProvider>
		</AppProvider>
	);
}

export default App;
