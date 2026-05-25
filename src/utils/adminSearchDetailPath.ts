import type { AdminSearchRouteParams } from '@/api/models/AdminSearchAutocompleteDto';

export type LocalizedPathBuilder = (englishPath: string) => string;

/**
 * Maps backend `routeParams` to a localized admin detail path matching AppRoutes.tsx.
 * Returns null when required ids are missing or the entity type is unknown.
 */
export function buildAdminSearchDetailPath(
	routeParams: AdminSearchRouteParams | null | undefined,
	getLocalizedPath: LocalizedPathBuilder
): string | null {
	if (!routeParams?.type) return null;

	const ids = routeParams.ids ?? {};

	switch (routeParams.type) {
		case 'user': {
			const userId = ids.userId ?? ids.entityId;
			if (!userId) return null;
			return getLocalizedPath(`/users/${userId}`);
		}
		case 'face': {
			const faceId = ids.faceId ?? ids.entityId;
			if (!faceId) return null;
			return getLocalizedPath(`/faces/${faceId}`);
		}
		case 'page': {
			const pageId = ids.pageId ?? ids.entityId;
			if (!pageId) return null;
			return getLocalizedPath(`/pages/${pageId}`);
		}
		case 'album': {
			const albumId = ids.albumId ?? ids.entityId;
			if (!albumId) return null;
			return getLocalizedPath(`/albums/${albumId}`);
		}
		case 'blog': {
			const blogId = ids.blogId ?? ids.entityId;
			if (!blogId) return null;
			return getLocalizedPath(`/blogs/${blogId}`);
		}
		case 'reel': {
			const reelId = ids.reelId ?? ids.entityId;
			if (!reelId) return null;
			return getLocalizedPath(`/reels/${reelId}`);
		}
		case 'story': {
			const storyId = ids.storyId ?? ids.entityId;
			if (!storyId) return null;
			return getLocalizedPath(`/stories/${storyId}`);
		}
		case 'face_chat_room': {
			const { faceId, roomId } = ids;
			if (!faceId || !roomId) return null;
			return getLocalizedPath(`/faces/${faceId}/chat-rooms/${roomId}`);
		}
		case 'video_lounge': {
			const { faceId, loungeId } = ids;
			if (!faceId || !loungeId) return null;
			return getLocalizedPath(`/faces/${faceId}/video-lounges/${loungeId}`);
		}
		case 'face_profile': {
			const { faceId, userId } = ids;
			if (!faceId || !userId) return null;
			return getLocalizedPath(`/faces/${faceId}/profiles/${userId}`);
		}
		case 'wall_ticket': {
			const faceId = ids.faceId;
			if (!faceId) return null;
			const base = getLocalizedPath(`/faces/${faceId}/wall-tickets`);
			const ticketId = ids.ticketId;
			if (ticketId) {
				return `${base}?ticketId=${encodeURIComponent(ticketId)}`;
			}
			return base;
		}
		default:
			return null;
	}
}

/** True when the hit has enough routing data to navigate safely. */
export function isAdminSearchHitNavigable(
	routeParams: AdminSearchRouteParams | null | undefined,
	getLocalizedPath: LocalizedPathBuilder
): boolean {
	return buildAdminSearchDetailPath(routeParams, getLocalizedPath) !== null;
}
