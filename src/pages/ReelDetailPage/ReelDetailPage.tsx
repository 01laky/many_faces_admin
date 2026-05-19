import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useReel } from '@/hooks/api/useReelsApi';
import { AdminReadOnlyDetailLayout } from '@/components/AdminReadOnlyDetailLayout/AdminReadOnlyDetailLayout';

export function ReelDetailPage() {
	const { id } = useParams<{ id: string }>();
	const [search] = useSearchParams();
	const reelId = id ? parseInt(id, 10) : 0;
	const faceId = parseInt(search.get('faceId') ?? '0', 10);
	const { t } = useTranslation('common');
	const { data, isLoading, isError, error } = useReel(reelId, faceId);

	const fields = data
		? [
				{ label: 'ID', value: data.id },
				{ label: t('pages.reelDetail.title'), value: data.title },
				{ label: t('pages.reelDetail.description'), value: data.description },
				{
					label: t('pages.reelDetail.videoUrl'),
					value: data.videoUrl ? (
						<a href={data.videoUrl} target="_blank" rel="noopener noreferrer">
							{data.videoUrl}
						</a>
					) : (
						'—'
					),
				},
				{ label: t('pages.reelDetail.approvalStatus'), value: data.approvalStatus },
			]
		: [];

	return (
		<AdminReadOnlyDetailLayout
			title={data?.title ?? t('pages.reelDetail.title')}
			backFaceId={faceId}
			fields={fields}
			isLoading={isLoading}
			isError={isError}
			errorMessage={error instanceof Error ? error.message : undefined}
		/>
	);
}
