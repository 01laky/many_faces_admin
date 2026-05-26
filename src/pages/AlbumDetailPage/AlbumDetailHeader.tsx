import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { ModerationStatusChips } from '@/components/ModerationStatusChips';
import type { AlbumDetailHeaderProps } from './types';
import './AlbumDetailHeader.scss';

export function AlbumDetailHeader({
	album,
	isSuperAdmin,
	onOpenChat,
	onOpenQueue,
}: AlbumDetailHeaderProps) {
	const { t } = useTranslation('common');
	const getLocalizedPath = useLocalizedLink();
	const mediaCount = album.mediaCount ?? album.mediaItems?.length ?? 0;

	return (
		<header className="album-detail-header" data-testid="album-detail-header">
			<div>
				<h2 className="album-detail-header__title">{album.title}</h2>
				<p className="text-muted mb-2">
					{t('pages.albumDetail.albumId')}: {album.id}
				</p>
				<ModerationStatusChips
					approvalStatus={album.approvalStatus}
					aiReviewStatus={album.aiReviewStatus}
				/>
				<p className="album-detail-header__meta mt-2">
					{t('pages.albumDetail.mediaCountLabel', { count: mediaCount })}
				</p>
			</div>
			<div className="album-detail-header__actions">
				{album.creatorId && (
					<Link
						to={getLocalizedPath(`/users/${album.creatorId}`)}
						className="btn btn-outline-primary btn-sm album-detail-header__action"
					>
						{t('pages.albumDetail.viewCreator')}
					</Link>
				)}
				{isSuperAdmin && album.creatorId && (
					<button
						type="button"
						className="btn btn-outline-primary btn-sm album-detail-header__action"
						onClick={onOpenChat}
					>
						{t('pages.albumDetail.openChat')}
					</button>
				)}
				{isSuperAdmin && (
					<button
						type="button"
						className="btn btn-outline-primary btn-sm album-detail-header__action"
						onClick={onOpenQueue}
					>
						{t('pages.albumDetail.openInQueue')}
					</button>
				)}
			</div>
		</header>
	);
}
