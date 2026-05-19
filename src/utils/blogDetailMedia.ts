import type { ContentMediaItem } from '@/types/contentMedia';

export interface BlogImageDto {
	id: number;
	imageUrl: string;
	sortOrder: number;
}

export function blogImagesToMediaItems(images: BlogImageDto[]): ContentMediaItem[] {
	return images.map((img) => ({
		id: img.id,
		mediaType: 'Image' as const,
		imageUrl: img.imageUrl,
		videoUrl: img.imageUrl,
		sortOrder: img.sortOrder,
		title: `Image ${img.sortOrder + 1}`,
	}));
}
