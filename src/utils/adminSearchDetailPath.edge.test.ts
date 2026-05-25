import { describe, expect, it } from 'vitest';
import {
	buildAdminSearchDetailPath,
	isAdminSearchHitNavigable,
} from '@/utils/adminSearchDetailPath';

const enPaths = {
	users: 'users',
	faces: 'faces',
};

function getLocalizedPath(path: string): string {
	const clean = path.startsWith('/') ? path.slice(1) : path;
	const segments = clean.split('/');
	const translated = segments.map((segment) => {
		if (segment === 'users') return enPaths.users;
		if (segment === 'faces') return enPaths.faces;
		return segment;
	});
	return `/en/${translated.join('/')}`;
}

describe('adminSearchDetailPath (GSH1-T-U05, GSH1-T-U06)', () => {
	it.each([
		['user', { userId: 'u1' }, '/en/users/u1'],
		['face', { faceId: 'f1' }, '/en/faces/f1'],
		['page', { pageId: 'p1' }, '/en/pages/p1'],
		['album', { albumId: 'a1' }, '/en/albums/a1'],
		['blog', { blogId: 'b1' }, '/en/blogs/b1'],
		['reel', { reelId: 'r1' }, '/en/reels/r1'],
		['story', { storyId: 's1' }, '/en/stories/s1'],
		['face_chat_room', { faceId: 'f1', roomId: 'cr1' }, '/en/faces/f1/chat-rooms/cr1'],
		['video_lounge', { faceId: 'f1', loungeId: 'vl1' }, '/en/faces/f1/video-lounges/vl1'],
		['face_profile', { faceId: 'f1', userId: 'u1' }, '/en/faces/f1/profiles/u1'],
		['wall_ticket', { faceId: 'f1' }, '/en/faces/f1/wall-tickets'],
		['wall_ticket', { faceId: 'f1', ticketId: 't1' }, '/en/faces/f1/wall-tickets?ticketId=t1'],
	] as const)('GSH1-T-U05: maps %s to AppRoutes detail path', (type, ids, expected) => {
		expect(buildAdminSearchDetailPath({ type, ids }, getLocalizedPath)).toBe(expected);
	});

	it('GSH1-T-U06: missing faceId on scoped entity returns null', () => {
		expect(
			buildAdminSearchDetailPath(
				{ type: 'face_chat_room', ids: { roomId: 'cr1' } },
				getLocalizedPath
			)
		).toBeNull();
		expect(
			isAdminSearchHitNavigable(
				{ type: 'video_lounge', ids: { loungeId: 'vl1' } },
				getLocalizedPath
			)
		).toBe(false);
	});
});
