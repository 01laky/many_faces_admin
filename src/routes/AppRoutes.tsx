import { Suspense, useCallback, useEffect, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LanguageRouter } from '@/components/LanguageRouter';
import { AdminLayout } from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { GuestRoute } from '@/components/GuestRoute';
import { LoginPage } from '@/pages/LoginPage';
import {
	DashboardPage,
	HomePageProtected,
	UsersPage,
	UserDetailPage,
	CreateUserPage,
	FacesPage,
	FaceDetailPage,
	FaceWallTicketsPage,
	ContentModerationPage,
	CreateFacePage,
	EditFacePage,
	CreatePagePage,
	EditPagePage,
	PageDetailPage,
	AlbumDetailPage,
	ReelDetailPage,
	BlogDetailPage,
	StoryDetailPage,
	FaceChatRoomDetailPage,
	FaceProfileDetailPage,
	ChatPage,
	UserChatPage,
	SettingsPage,
	RegistrationInvitesPage,
} from './lazyAdminPages';
import { RouteLoadingFallback } from './RouteLoadingFallback';
import { UserEditRedirect } from './UserEditRedirect';
import { useAdminRoutePaths } from './useAdminRoutePaths';
import { logger } from '@/utils/logger';
import { env } from '@/config/env';
import { supportedLanguages } from '@/i18n/config';

export function AppRoutes() {
	const {
		login: loginPaths,
		dashboard: dashboardPaths,
		homepage: homepagePaths,
		users: usersPaths,
		faces: facesPaths,
		moderation: moderationPaths,
		chat: chatPaths,
		userChat: userChatPaths,
		settings: settingsPaths,
		registrationInvites: registrationInvitesPaths,
	} = useAdminRoutePaths();

	useEffect(() => {
		if (env.debugMode) {
			logger.info('Admin app routes mounted', { appName: env.appName });
		}
	}, []);

	const withLayout = useCallback((page: ReactNode) => <AdminLayout>{page}</AdminLayout>, []);

	return (
		<Suspense
			fallback={
				<div className="admin-route-loading-wrap" style={{ padding: '2rem', textAlign: 'center' }}>
					<RouteLoadingFallback />
				</div>
			}
		>
			<Routes>
				<Route path="/" element={<Navigate to={`/${supportedLanguages[0]}`} replace />} />

				<Route path="/:lang" element={<LanguageRouter />}>
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

					{dashboardPaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={
								<ProtectedRoute redirectTo="login">{withLayout(<DashboardPage />)}</ProtectedRoute>
							}
						/>
					))}

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
							element={<UserEditRedirect />}
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
							key={`${path}/:id/wall-tickets`}
							path={`${path}/:id/wall-tickets`}
							element={
								<ProtectedRoute redirectTo="login">
									{withLayout(<FaceWallTicketsPage />)}
								</ProtectedRoute>
							}
						/>
					))}

					{moderationPaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={
								<ProtectedRoute redirectTo="login">
									{withLayout(<ContentModerationPage />)}
								</ProtectedRoute>
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

					<Route
						path="albums/:id"
						element={
							<ProtectedRoute redirectTo="login">{withLayout(<AlbumDetailPage />)}</ProtectedRoute>
						}
					/>
					<Route
						path="reels/:id"
						element={
							<ProtectedRoute redirectTo="login">{withLayout(<ReelDetailPage />)}</ProtectedRoute>
						}
					/>
					<Route
						path="blogs/:id"
						element={
							<ProtectedRoute redirectTo="login">{withLayout(<BlogDetailPage />)}</ProtectedRoute>
						}
					/>
					<Route
						path="stories/:id"
						element={
							<ProtectedRoute redirectTo="login">{withLayout(<StoryDetailPage />)}</ProtectedRoute>
						}
					/>

					{facesPaths.map((path) => (
						<Route
							key={`${path}/:faceId/chat-rooms/:roomId`}
							path={`${path}/:faceId/chat-rooms/:roomId`}
							element={
								<ProtectedRoute redirectTo="login">
									{withLayout(<FaceChatRoomDetailPage />)}
								</ProtectedRoute>
							}
						/>
					))}
					{facesPaths.map((path) => (
						<Route
							key={`${path}/:faceId/profiles/:userId`}
							path={`${path}/:faceId/profiles/:userId`}
							element={
								<ProtectedRoute redirectTo="login">
									{withLayout(<FaceProfileDetailPage />)}
								</ProtectedRoute>
							}
						/>
					))}

					{chatPaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={
								<ProtectedRoute redirectTo="login">{withLayout(<ChatPage />)}</ProtectedRoute>
							}
						/>
					))}

					{userChatPaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={
								<ProtectedRoute redirectTo="login">{withLayout(<UserChatPage />)}</ProtectedRoute>
							}
						/>
					))}

					{registrationInvitesPaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={
								<ProtectedRoute redirectTo="login">
									{withLayout(<RegistrationInvitesPage />)}
								</ProtectedRoute>
							}
						/>
					))}

					{settingsPaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={
								<ProtectedRoute redirectTo="login">{withLayout(<SettingsPage />)}</ProtectedRoute>
							}
						/>
					))}

					<Route path="*" element={<Navigate to=".." replace />} />
				</Route>

				<Route path="*" element={<Navigate to={`/${supportedLanguages[0]}`} replace />} />
			</Routes>
		</Suspense>
	);
}
