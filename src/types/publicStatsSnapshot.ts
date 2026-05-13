/**
 * Public aggregate stats returned by `GET /api/Stats/public` (camelCase JSON).
 * Must stay in sync with backend `PublicStatsSnapshotDto` — update in the same
 * change as OpenAPI regen (`yarn generate:api`) when the contract changes.
 */
export interface PublicStatsSnapshot {
	usersCount: number;
	facesCount: number;
	pagesCount: number;
	friendshipsCount: number;
	friendRequestsPendingCount: number;
	messagesCount: number;
	albumsCount: number;
	blogsCount: number;
	reelsCount: number;
	storiesCount: number;
	storyViewsCount: number;
	faceWallTicketsCount: number;
	faceChatRoomsCount: number;
	faceChatRoomMessagesCount: number;
}
