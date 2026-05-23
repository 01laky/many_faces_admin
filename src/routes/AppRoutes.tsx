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
	FaceVideoLoungeDetailPage,
	FaceProfileDetailPage,
	ChatPage,
	UserChatPage,
	SettingsPage,
} from './lazyAdminPages';
import { RouteLoadingFallback } from './RouteLoadingFallback';
import { protectedLayoutRoute } from './routeHelpers';
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
							element={protectedLayoutRoute(withLayout, <DashboardPage />)}
						/>
					))}

					{homepagePaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={protectedLayoutRoute(withLayout, <HomePageProtected />)}
						/>
					))}

					{usersPaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={protectedLayoutRoute(withLayout, <UsersPage />)}
						/>
					))}

					{usersPaths.map((path) => (
						<Route
							key={`${path}/:id`}
							path={`${path}/:id`}
							element={protectedLayoutRoute(withLayout, <UserDetailPage />)}
						/>
					))}

					{usersPaths.map((path) => (
						<Route
							key={`${path}/create`}
							path={`${path}/create`}
							element={protectedLayoutRoute(withLayout, <CreateUserPage />)}
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
							element={protectedLayoutRoute(withLayout, <FacesPage />)}
						/>
					))}

					{facesPaths.map((path) => (
						<Route
							key={`${path}/:id`}
							path={`${path}/:id`}
							element={protectedLayoutRoute(withLayout, <FaceDetailPage />)}
						/>
					))}

					{facesPaths.map((path) => (
						<Route
							key={`${path}/create`}
							path={`${path}/create`}
							element={protectedLayoutRoute(withLayout, <CreateFacePage />)}
						/>
					))}

					{facesPaths.map((path) => (
						<Route
							key={`${path}/:id/edit`}
							path={`${path}/:id/edit`}
							element={protectedLayoutRoute(withLayout, <EditFacePage />)}
						/>
					))}

					{facesPaths.map((path) => (
						<Route
							key={`${path}/:id/wall-tickets`}
							path={`${path}/:id/wall-tickets`}
							element={protectedLayoutRoute(withLayout, <FaceWallTicketsPage />)}
						/>
					))}

					{moderationPaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={protectedLayoutRoute(withLayout, <ContentModerationPage />)}
						/>
					))}

					{facesPaths.map((path) => (
						<Route
							key={`${path}/:faceId/pages/create`}
							path={`${path}/:faceId/pages/create`}
							element={protectedLayoutRoute(withLayout, <CreatePagePage />)}
						/>
					))}

					<Route path="pages/:id" element={protectedLayoutRoute(withLayout, <PageDetailPage />)} />

					<Route
						path="pages/:id/edit"
						element={protectedLayoutRoute(withLayout, <EditPagePage />)}
					/>

					<Route
						path="albums/:id"
						element={protectedLayoutRoute(withLayout, <AlbumDetailPage />)}
					/>
					<Route path="reels/:id" element={protectedLayoutRoute(withLayout, <ReelDetailPage />)} />
					<Route path="blogs/:id" element={protectedLayoutRoute(withLayout, <BlogDetailPage />)} />
					<Route
						path="stories/:id"
						element={protectedLayoutRoute(withLayout, <StoryDetailPage />)}
					/>

					{facesPaths.map((path) => (
						<Route
							key={`${path}/:faceId/chat-rooms/:roomId`}
							path={`${path}/:faceId/chat-rooms/:roomId`}
							element={protectedLayoutRoute(withLayout, <FaceChatRoomDetailPage />)}
						/>
					))}
					{facesPaths.map((path) => (
						<Route
							key={`${path}/:faceId/video-lounges/:loungeId`}
							path={`${path}/:faceId/video-lounges/:loungeId`}
							element={protectedLayoutRoute(withLayout, <FaceVideoLoungeDetailPage />)}
						/>
					))}
					{facesPaths.map((path) => (
						<Route
							key={`${path}/:faceId/profiles/:userId`}
							path={`${path}/:faceId/profiles/:userId`}
							element={protectedLayoutRoute(withLayout, <FaceProfileDetailPage />)}
						/>
					))}

					{chatPaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={protectedLayoutRoute(withLayout, <ChatPage />)}
						/>
					))}

					{userChatPaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={protectedLayoutRoute(withLayout, <UserChatPage />)}
						/>
					))}

					{settingsPaths.map((path) => (
						<Route
							key={path}
							path={path}
							element={protectedLayoutRoute(withLayout, <SettingsPage />)}
						/>
					))}

					<Route path="*" element={<Navigate to=".." replace />} />
				</Route>

				<Route path="*" element={<Navigate to={`/${supportedLanguages[0]}`} replace />} />
			</Routes>
		</Suspense>
	);
}
