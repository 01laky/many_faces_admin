import { useTranslation } from 'react-i18next';
import { Button } from '@/components/radix/Button';
import { handleGridDeleteClick, type ContentMediaItem } from '@/types/contentMedia';
import './ContentMediaGrid.scss';

export interface ContentMediaGridProps {
	items: ContentMediaItem[];
	onOpenPreview: (index: number) => void;
	onDeleteItem?: (mediaId: number) => void;
	showDelete?: boolean;
}

export function ContentMediaGrid({
	items,
	onOpenPreview,
	onDeleteItem,
	showDelete = false,
}: ContentMediaGridProps) {
	const { t } = useTranslation('common');

	if (items.length === 0) {
		return <p className="text-muted">{t('pages.albumDetail.mediaEmpty')}</p>;
	}

	return (
		<div className="content-media-grid" data-testid="content-media-grid">
			{items.map((item, index) => {
				const thumb = item.thumbnailUrl || item.imageUrl;
				const isVideo = item.mediaType === 'Video';
				return (
					<div key={item.id} className="content-media-grid__tile-wrap">
						<button
							type="button"
							className="content-media-grid__tile"
							onClick={() => onOpenPreview(index)}
							aria-label={item.title ?? `Media ${index + 1}`}
						>
							<img src={thumb} alt="" loading="lazy" />
							{isVideo && (
								<span className="badge bg-dark content-media-grid__video-badge">
									{t('pages.albumDetail.videoBadge')}
								</span>
							)}
						</button>
						{showDelete && onDeleteItem && (
							<Button
								type="button"
								variant="danger"
								size="sm"
								className="content-media-grid__delete"
								aria-label={t('pages.albumDetail.deleteMedia')}
								onClick={(e) => handleGridDeleteClick(e, () => onDeleteItem(item.id))}
							>
								×
							</Button>
						)}
					</div>
				);
			})}
		</div>
	);
}
