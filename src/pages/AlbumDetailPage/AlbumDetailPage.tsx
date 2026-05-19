import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAlbum } from '@/hooks/api/useAlbumsApi';
import { AdminReadOnlyDetailLayout } from '@/components/AdminReadOnlyDetailLayout/AdminReadOnlyDetailLayout';

export function AlbumDetailPage() {
	const { id } = useParams<{ id: string }>();
	const [search] = useSearchParams();
	const albumId = id ? parseInt(id, 10) : 0;
	const faceId = parseInt(search.get('faceId') ?? '0', 10);
	const { t } = useTranslation('common');
	const { data, isLoading, isError, error } = useAlbum(albumId, faceId);

	const fields = data
		? [
				{ label: 'ID', value: data.id },
				{ label: t('pages.albumDetail.title'), value: data.title },
				{ label: t('pages.albumDetail.description'), value: data.description },
				{ label: t('pages.albumDetail.approvalStatus'), value: data.approvalStatus },
				{ label: t('pages.albumDetail.aiReviewStatus'), value: data.aiReviewStatus },
				{ label: t('pages.albumDetail.creatorStatusLabel'), value: data.creatorStatusLabel },
				{ label: t('pages.albumDetail.aiReviewUserMessage'), value: data.aiReviewUserMessage },
				{ label: t('pages.albumDetail.humanDecisionReason'), value: data.humanDecisionReason },
				{
					label: t('pages.albumDetail.createdAt'),
					value: data.createdAt ? new Date(data.createdAt).toLocaleString() : '—',
				},
			]
		: [];

	return (
		<AdminReadOnlyDetailLayout
			title={data?.title ?? t('pages.albumDetail.title')}
			backFaceId={faceId}
			fields={fields}
			isLoading={isLoading}
			isError={isError}
			errorMessage={error instanceof Error ? error.message : undefined}
		/>
	);
}
