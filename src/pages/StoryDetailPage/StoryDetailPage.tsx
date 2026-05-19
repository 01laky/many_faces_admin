import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStory } from '@/hooks/api/useStoriesApi';
import { AdminReadOnlyDetailLayout } from '@/components/AdminReadOnlyDetailLayout/AdminReadOnlyDetailLayout';

export function StoryDetailPage() {
	const { id } = useParams<{ id: string }>();
	const [search] = useSearchParams();
	const storyId = id ? parseInt(id, 10) : 0;
	const faceId = parseInt(search.get('faceId') ?? '0', 10);
	const { t } = useTranslation('common');
	const { data, isLoading, isError, error } = useStory(storyId, faceId);

	const fields = data
		? [
				{ label: 'ID', value: data.id },
				{ label: t('pages.storyDetail.title'), value: data.title },
				{ label: t('pages.storyDetail.state'), value: data.state },
				{
					label: t('pages.storyDetail.publishedAt'),
					value: data.publishedAt ? new Date(data.publishedAt).toLocaleString() : '—',
				},
			]
		: [];

	return (
		<AdminReadOnlyDetailLayout
			title={data?.title ?? t('pages.storyDetail.title')}
			backFaceId={faceId}
			fields={fields}
			isLoading={isLoading}
			isError={isError}
			errorMessage={error instanceof Error ? error.message : undefined}
		/>
	);
}
