import type { ContentMediaItem } from '@/types/contentMedia';

/** Maps a reel row to a single-item preview payload for ContentMediaPreviewModal. */
export function reelToPreviewItem(
	reelId: number,
	title: string,
	videoUrl: string | undefined | null
): ContentMediaItem {
	const url = videoUrl?.trim() ?? '';
	return {
		id: reelId,
		mediaType: 'Video',
		videoUrl: url,
		imageUrl: url,
		sortOrder: 0,
		title,
	};
}
