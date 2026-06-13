import { lazy } from 'react';

/** Lazy route chunks — keep `LoginPage` eager in `AppRoutes` for fast first paint on `/login`. */
export const DashboardPage = lazy(() =>
	import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
export const HomePageProtected = lazy(() =>
	import('../pages/HomePageProtected').then((m) => ({ default: m.HomePageProtected }))
);
export const UsersPage = lazy(() =>
	import('../pages/UsersPage').then((m) => ({ default: m.UsersPage }))
);
export const UserDetailPage = lazy(() =>
	import('../pages/UserDetailPage').then((m) => ({ default: m.UserDetailPage }))
);
export const CreateUserPage = lazy(() =>
	import('../pages/CreateUserPage').then((m) => ({ default: m.CreateUserPage }))
);
export const FacesPage = lazy(() =>
	import('../pages/FacesPage').then((m) => ({ default: m.FacesPage }))
);
export const FaceDetailPage = lazy(() =>
	import('../pages/FaceDetailPage').then((m) => ({ default: m.FaceDetailPage }))
);
export const FaceWallTicketsPage = lazy(() =>
	import('../pages/FaceWallTicketsPage').then((m) => ({ default: m.FaceWallTicketsPage }))
);
export const ContentModerationPage = lazy(() =>
	import('../pages/ContentModerationPage').then((m) => ({ default: m.ContentModerationPage }))
);
export const CreateFacePage = lazy(() =>
	import('../pages/CreateFacePage').then((m) => ({ default: m.CreateFacePage }))
);
export const EditFacePage = lazy(() =>
	import('../pages/EditFacePage').then((m) => ({ default: m.EditFacePage }))
);
export const CreatePagePage = lazy(() =>
	import('../pages/CreatePagePage').then((m) => ({ default: m.CreatePagePage }))
);
export const EditPagePage = lazy(() =>
	import('../pages/EditPagePage').then((m) => ({ default: m.EditPagePage }))
);
export const PageDetailPage = lazy(() =>
	import('../pages/PageDetailPage/PageDetailPage').then((m) => ({ default: m.PageDetailPage }))
);
export const AlbumDetailPage = lazy(() =>
	import('../pages/AlbumDetailPage/AlbumDetailPage').then((m) => ({ default: m.AlbumDetailPage }))
);
export const ReelDetailPage = lazy(() =>
	import('../pages/ReelDetailPage/ReelDetailPage').then((m) => ({ default: m.ReelDetailPage }))
);
export const BlogDetailPage = lazy(() =>
	import('../pages/BlogDetailPage/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage }))
);
export const StoryDetailPage = lazy(() =>
	import('../pages/StoryDetailPage/StoryDetailPage').then((m) => ({ default: m.StoryDetailPage }))
);
export const FaceChatRoomDetailPage = lazy(() =>
	import('../pages/FaceChatRoomDetailPage/FaceChatRoomDetailPage').then((m) => ({
		default: m.FaceChatRoomDetailPage,
	}))
);
export const FaceVideoLoungeDetailPage = lazy(() =>
	import('../pages/FaceVideoLoungeDetailPage/FaceVideoLoungeDetailPage').then((m) => ({
		default: m.FaceVideoLoungeDetailPage,
	}))
);
export const FaceProfileDetailPage = lazy(() =>
	import('../pages/FaceProfileDetailPage/FaceProfileDetailPage').then((m) => ({
		default: m.FaceProfileDetailPage,
	}))
);
export const ChatPage = lazy(() =>
	import('../pages/ChatPage').then((m) => ({ default: m.ChatPage }))
);
export const UserChatPage = lazy(() =>
	import('../pages/UserChatPage/UserChatPage').then((m) => ({ default: m.UserChatPage }))
);
export const SettingsPage = lazy(() =>
	import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
export const AdminProfilePage = lazy(() =>
	import('../pages/AdminProfilePage/AdminProfilePage').then((m) => ({
		default: m.AdminProfilePage,
	}))
);
