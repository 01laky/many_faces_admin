/** Shared album/blog/story media row shape from GET detail APIs. */
export type ContentMediaType = 'Image' | 'Video';

export interface ContentMediaItem {
	id: number;
	mediaType: ContentMediaType;
	imageUrl: string;
	videoUrl?: string | null;
	thumbnailUrl?: string | null;
	sortOrder: number;
	title?: string | null;
}

export function isVideoMediaItem(item: ContentMediaItem): boolean {
	return item.mediaType === 'Video';
}

/** Grid delete handler: stopPropagation so tile click does not open preview. */
export function handleGridDeleteClick(
	event: { stopPropagation: () => void },
	onDelete: () => void
): void {
	event.stopPropagation();
	onDelete();
}
