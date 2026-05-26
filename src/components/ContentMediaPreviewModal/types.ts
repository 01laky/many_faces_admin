export interface ContentMediaPreviewModalProps {
	show: boolean;
	items: ContentMediaItem[];
	index: number;
	onIndexChange: (index: number) => void;
	onClose: () => void;
	onDeleteCurrent?: () => void;
	showDelete?: boolean;
}
