import type { ContentMediaItem } from '@/types/contentMedia';

export interface ContentMediaGridProps {
	items: ContentMediaItem[];
	onOpenPreview: (index: number) => void;
	onDeleteItem?: (mediaId: number) => void;
	showDelete?: boolean;
}
