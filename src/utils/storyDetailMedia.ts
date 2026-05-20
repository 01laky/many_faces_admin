import type { ContentMediaItem } from '@/types/contentMedia';

export interface StoryImageDto {
	id: number;
	imageUrl: string;
	description?: string | null;
	sortOrder: number;
}

/** Maps API story images to grid items sorted by sortOrder ascending. */
export function storyImagesToMediaItems(
	storyId: number,
	title: string,
	images: StoryImageDto[]
): ContentMediaItem[] {
	return [...images]
		.sort((a, b) => a.sortOrder - b.sortOrder)
		.map((img) => ({
			id: img.id,
			mediaType: 'Image' as const,
			imageUrl: img.imageUrl,
			videoUrl: img.imageUrl,
			sortOrder: img.sortOrder,
			title: img.description?.trim() || title,
		}));
}
