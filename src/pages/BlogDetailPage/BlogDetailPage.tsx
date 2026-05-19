import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBlog } from '@/hooks/api/useBlogsApi';
import { AdminReadOnlyDetailLayout } from '@/components/AdminReadOnlyDetailLayout/AdminReadOnlyDetailLayout';

export function BlogDetailPage() {
	const { id } = useParams<{ id: string }>();
	const [search] = useSearchParams();
	const blogId = id ? parseInt(id, 10) : 0;
	const faceId = parseInt(search.get('faceId') ?? '0', 10);
	const { t } = useTranslation('common');
	const { data, isLoading, isError, error } = useBlog(blogId, faceId);

	const contentPreview =
		data?.content && data.content.length > 500 ? `${data.content.slice(0, 500)}…` : data?.content;

	const fields = data
		? [
				{ label: 'ID', value: data.id },
				{ label: t('pages.blogDetail.title'), value: data.title },
				{ label: t('pages.blogDetail.content'), value: contentPreview },
				{ label: t('pages.blogDetail.approvalStatus'), value: data.approvalStatus },
			]
		: [];

	return (
		<AdminReadOnlyDetailLayout
			title={data?.title ?? t('pages.blogDetail.title')}
			backFaceId={faceId}
			fields={fields}
			isLoading={isLoading}
			isError={isError}
			errorMessage={error instanceof Error ? error.message : undefined}
		/>
	);
}
