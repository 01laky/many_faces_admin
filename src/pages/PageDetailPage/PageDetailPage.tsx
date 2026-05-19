import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePage } from '@/hooks/api/usePagesApi';
import { AdminReadOnlyDetailLayout } from '@/components/AdminReadOnlyDetailLayout/AdminReadOnlyDetailLayout';

export function PageDetailPage() {
	const { id } = useParams<{ id: string }>();
	const pageId = id ? parseInt(id, 10) : 0;
	const { t } = useTranslation('common');
	const { data, isLoading, isError, error } = usePage(pageId);

	const fields = data
		? [
				{ label: 'ID', value: data.id },
				{ label: t('pages.pageDetail.name'), value: data.name },
				{ label: t('pages.pageDetail.path'), value: data.path },
				{ label: t('pages.pageDetail.index'), value: data.index },
				{ label: t('pages.pageDetail.description'), value: data.description },
				{
					label: t('pages.pageDetail.createdAt'),
					value: data.createdAt ? new Date(data.createdAt).toLocaleString() : '—',
				},
			]
		: [];

	return (
		<AdminReadOnlyDetailLayout
			title={data?.name ?? t('pages.pageDetail.title')}
			backFaceId={data?.faceId ?? 0}
			fields={fields}
			isLoading={isLoading}
			isError={isError}
			errorMessage={error instanceof Error ? error.message : undefined}
		/>
	);
}
