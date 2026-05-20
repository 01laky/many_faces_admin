export interface StoryFaceRef {
	faceId: number;
	title?: string;
}

/** Portal live window — Published within publishedAt..expiresAt (display-only on operator detail). */
export function isStoryLive(
	state: string | undefined,
	publishedAt: string | null | undefined,
	expiresAt: string | null | undefined,
	now: Date = new Date()
): boolean {
	if (state !== 'Published') return false;
	if (!publishedAt || !expiresAt) return false;
	const start = new Date(publishedAt);
	const end = new Date(expiresAt);
	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
	return start <= now && end > now;
}

export function storyStateLabelKey(state: string | undefined): string {
	switch (state) {
		case 'Draft':
			return 'pages.storyDetail.stateDraft';
		case 'Scheduled':
			return 'pages.storyDetail.stateScheduled';
		case 'Published':
			return 'pages.storyDetail.statePublished';
		case 'Expired':
			return 'pages.storyDetail.stateExpired';
		default:
			return 'pages.storyDetail.state';
	}
}

/** Picks face id for story detail navigation from user-detail table rows. */
export function resolveStoryDetailFaceId(
	row: { faces?: StoryFaceRef[] },
	userFaceIds: number[]
): number {
	const storyFaceIds = row.faces?.map((f) => f.faceId) ?? [];
	const shared = storyFaceIds.find((id) => userFaceIds.includes(id));
	return shared ?? storyFaceIds[0] ?? userFaceIds[0] ?? 0;
}

export function mapStoryDetailError(error: unknown): string | null {
	if (!(error instanceof Error)) return null;
	const msg = error.message;
	if (msg.includes('image_delete_blocked_live')) return 'pages.storyDetail.imageDeleteBlockedLive';
	return null;
}
