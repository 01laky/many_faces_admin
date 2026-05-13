/**
 * Client-side mirror of the backend `AdminDashboardSummaryDto` (camelCase JSON from `GET /api/Stats`).
 * Keep in sync with the backend DTO; API tests are the source of truth for field presence.
 */
export interface AdminDashboardSummary {
	usersCount: number;
	friendRequestsCount: number;
	messagesCount: number;

	facesCount: number;
	pagesCount: number;
	pageComponentsCount: number;
	pageRouteTranslationsCount: number;

	friendshipsCount: number;
	friendRequestsAcceptedCount: number;
	friendRequestsRejectedCount: number;
	userFollowsCount: number;
	userBlocksCount: number;

	messagesPendingRequestCount: number;

	notificationsCount: number;

	albumsCount: number;
	blogsCount: number;
	reelsCount: number;
	storiesCount: number;
	storyViewsCount: number;

	faceChatRoomsCount: number;
	faceChatRoomMembersCount: number;
	faceChatRoomMessagesCount: number;
	faceChatRoomJoinRequestsPendingCount: number;

	faceWallTicketsCount: number;
	faceWallTicketsByStatus: Record<string, number>;
	faceWallTicketCommentsCount: number;
	faceWallTicketLikesCount: number;

	userFaceProfilesCount: number;
	userFaceProfileLikesCount: number;
	userFaceProfileCommentsCount: number;
	userFaceProfileReviewsCount: number;

	albumCommentsCount: number;
	blogCommentsCount: number;
	reelCommentsCount: number;
	storyCommentsCount: number;
	albumLikesCount: number;
	blogLikesCount: number;
	reelLikesCount: number;
	storyLikesCount: number;

	aiReviewJobsCount: number;
	contentModerationEventsCount: number;

	oauthClientsCount: number;
}

/** Allowed {@code metric} query values for {@code GET /api/Stats/timeseries} (lowercase). */
export type StatsTimeseriesMetric =
	| 'users'
	| 'messages'
	| 'stories'
	| 'blogs'
	| 'reels'
	| 'albums'
	| 'friendrequests'
	| 'walltickets';

export interface StatsTimeseriesBucket {
	periodStartUtc: string;
	count: number;
}

export interface StatsTimeseriesResponse {
	metric: string;
	bucket: string;
	buckets: StatsTimeseriesBucket[];
}
