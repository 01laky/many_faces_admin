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
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageRouter } from './components/LanguageRouter';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import { HomePage } from './pages/HomePage';
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
  // This allows routes to work in all supported languages
  const loginPaths = getRoutePaths('login'); // ['login', 'prihlasenie', 'prihlaseni']
  const homepagePaths = getRoutePaths('homepage'); // ['homepage', 'domov', 'domu']
  const usersPaths = getRoutePaths('users'); // ['users', 'pouzivatelia', 'uzivatele']
  const facesPaths = getRoutePaths('faces'); // ['faces', 'tvare', 'tvare']

  // Get authentication state to conditionally render Sidebar and Header
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* 
        Conditionally render Sidebar and Header only when user is authenticated
        These components provide navigation and user menu for admin panel
      */}
      {isAuthenticated && <Sidebar />}
      {isAuthenticated && <Header />}
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
          {/* 
            Root route - protected, redirects to login if not authenticated
            Example: /en -> shows HomePage (if authenticated) or redirects to /en/login
          */}
          <Route
            index
            element={
              <ProtectedRoute redirectTo="login">
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* 
            Login route with all language translations - guest only
            GuestRoute prevents authenticated users from accessing login page
            Maps all login translations: /en/login, /sk/prihlasenie, /cz/prihlaseni
          */}
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

          {/* 
            Protected homepage route with all language translations
            ProtectedRoute requires authentication - redirects to login if not authenticated
            Maps all homepage translations: /en/homepage, /sk/domov, /cz/domu
          */}
          {homepagePaths.map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute redirectTo="login">
                  <HomePageProtected />
                </ProtectedRoute>
              }
            />
          ))}

          {/* 
            Protected users list route with all language translations
            Displays table of all users with pagination and filtering
            Maps all users translations: /en/users, /sk/pouzivatelia, /cz/uzivatele
          */}
          {usersPaths.map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute redirectTo="login">
                  <UsersPage />
                </ProtectedRoute>
              }
            />
          ))}

          {/* 
            Protected user detail route - uses :id parameter to show specific user
            Example: /en/users/123, /sk/pouzivatelia/123
            Displays detailed information about a single user
          */}
          {usersPaths.map((path) => (
            <Route
              key={`${path}/:id`}
              path={`${path}/:id`}
              element={
                <ProtectedRoute redirectTo="login">
                  <UserDetailPage />
                </ProtectedRoute>
              }
            />
          ))}

          {/* 
            Protected user create route - form to create new user
            Example: /en/users/create, /sk/pouzivatelia/create
          */}
          {usersPaths.map((path) => (
            <Route
              key={`${path}/create`}
              path={`${path}/create`}
              element={
                <ProtectedRoute redirectTo="login">
                  <CreateUserPage />
                </ProtectedRoute>
              }
            />
          ))}

          {/* 
            Protected user edit route - uses :id parameter to edit specific user
            Example: /en/users/123/edit, /sk/pouzivatelia/123/edit
            Displays form pre-filled with user data
          */}
          {usersPaths.map((path) => (
            <Route
              key={`${path}/:id/edit`}
              path={`${path}/:id/edit`}
              element={
                <ProtectedRoute redirectTo="login">
                  <EditUserPage />
                </ProtectedRoute>
              }
            />
          ))}

          {/* 
            Protected faces list route with all language translations
            Displays table of all faces with pagination and filtering
            Maps all faces translations: /en/faces, /sk/tvare, /cz/tvare
          */}
          {facesPaths.map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute redirectTo="login">
                  <FacesPage />
                </ProtectedRoute>
              }
            />
          ))}

          {/* 
            Protected face detail route - uses :id parameter to show specific face
            Example: /en/faces/123, /sk/tvare/123
            Displays detailed information about a single face and its pages
          */}
          {facesPaths.map((path) => (
            <Route
              key={`${path}/:id`}
              path={`${path}/:id`}
              element={
                <ProtectedRoute redirectTo="login">
                  <FaceDetailPage />
                </ProtectedRoute>
              }
            />
          ))}

          {/* 
            Protected face create route - form to create new face
            Example: /en/faces/create, /sk/tvare/create
          */}
          {facesPaths.map((path) => (
            <Route
              key={`${path}/create`}
              path={`${path}/create`}
              element={
                <ProtectedRoute redirectTo="login">
                  <CreateFacePage />
                </ProtectedRoute>
              }
            />
          ))}

          {/* 
            Protected face edit route - uses :id parameter to edit specific face
            Example: /en/faces/123/edit, /sk/tvare/123/edit
            Displays form pre-filled with face data
          */}
          {facesPaths.map((path) => (
            <Route
              key={`${path}/:id/edit`}
              path={`${path}/:id/edit`}
              element={
                <ProtectedRoute redirectTo="login">
                  <EditFacePage />
                </ProtectedRoute>
              }
            />
          ))}

          {/* 
            Protected page create route - uses :faceId parameter to create page for specific face
            Example: /en/faces/123/pages/create, /sk/tvare/123/pages/create
            Creates a new page associated with the specified face
          */}
          {facesPaths.map((path) => (
            <Route
              key={`${path}/:faceId/pages/create`}
              path={`${path}/:faceId/pages/create`}
              element={
                <ProtectedRoute redirectTo="login">
                  <CreatePagePage />
                </ProtectedRoute>
              }
            />
          ))}

          {/* 
            Protected page detail route - uses :id parameter to show specific page
            Example: /en/pages/123
            Must be defined before edit route to avoid route conflicts
            Displays detailed information about a single page
          */}
          <Route
            path="pages/:id"
            element={
              <ProtectedRoute redirectTo="login">
                <PageDetailPage />
              </ProtectedRoute>
            }
          />

          {/* 
            Protected page edit route - uses :id parameter to edit specific page
            Example: /en/pages/123/edit
            Displays form pre-filled with page data
          */}
          <Route
            path="pages/:id/edit"
            element={
              <ProtectedRoute redirectTo="login">
                <EditPagePage />
              </ProtectedRoute>
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
