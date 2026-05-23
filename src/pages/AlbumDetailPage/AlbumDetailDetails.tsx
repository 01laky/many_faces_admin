import { useTranslation } from 'react-i18next';
import { ModerationStatusChips } from '@/components/ModerationStatusChips';
import type { AlbumDetail } from '@/hooks/api/useAlbumsApi';
import { formatDate, formatValue } from '@/utils/operatorDetailFormat';

export interface AlbumDetailDetailsProps {
	album: AlbumDetail;
}

/** Grouped metadata panel (moderation, messages, audit) below the media grid. */
export function AlbumDetailDetails({ album }: AlbumDetailDetailsProps) {
	const { t } = useTranslation('common');

	return (
		<div className="album-detail-details" data-testid="album-detail-details">
			<section className="album-detail-card album-detail-details__section">
				<h3 className="album-detail-details__heading">{t('pages.albumDetail.overviewSection')}</h3>
				<dl className="album-detail-details__grid">
					<div className="album-detail-details__item">
						<dt>{t('pages.albumDetail.albumId')}</dt>
						<dd>{album.id}</dd>
					</div>
					<div className="album-detail-details__item album-detail-details__item--wide">
						<dt>{t('pages.albumDetail.description')}</dt>
						<dd>{formatValue(album.description)}</dd>
					</div>
					<div className="album-detail-details__item">
						<dt>{t('pages.albumDetail.createdAt')}</dt>
						<dd>{formatDate(album.createdAt)}</dd>
					</div>
				</dl>
			</section>

			<section className="album-detail-card album-detail-details__section">
				<h3 className="album-detail-details__heading">
					{t('pages.albumDetail.moderationSection')}
				</h3>
				<dl className="album-detail-details__grid">
					<div className="album-detail-details__item">
						<dt>{t('pages.albumDetail.approvalStatus')}</dt>
						<dd>
							<ModerationStatusChips
								approvalStatus={album.approvalStatus}
								aiReviewStatus={album.aiReviewStatus}
							/>
						</dd>
					</div>
					<div className="album-detail-details__item">
						<dt>{t('pages.albumDetail.aiReviewStatus')}</dt>
						<dd>
							<span className="album-detail-details__enum">
								{formatValue(album.aiReviewStatus)}
							</span>
						</dd>
					</div>
					<div className="album-detail-details__item">
						<dt>{t('pages.albumDetail.creatorStatusLabel')}</dt>
						<dd>{formatValue(album.creatorStatusLabel)}</dd>
					</div>
				</dl>
			</section>

			<section className="album-detail-card album-detail-details__section">
				<h3 className="album-detail-details__heading">{t('pages.albumDetail.messagesSection')}</h3>
				<dl className="album-detail-details__grid">
					<div className="album-detail-details__item album-detail-details__item--wide">
						<dt>{t('pages.albumDetail.aiReviewUserMessage')}</dt>
						<dd className="album-detail-details__multiline">
							{formatValue(album.aiReviewUserMessage)}
						</dd>
					</div>
					<div className="album-detail-details__item album-detail-details__item--wide">
						<dt>{t('pages.albumDetail.humanDecisionReason')}</dt>
						<dd className="album-detail-details__multiline">
							{formatValue(album.humanDecisionReason)}
						</dd>
					</div>
				</dl>
			</section>
		</div>
	);
}
