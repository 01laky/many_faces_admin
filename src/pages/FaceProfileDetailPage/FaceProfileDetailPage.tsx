import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFaceProfile } from '@/hooks/api/useFaceProfilesApi';
import { AdminReadOnlyDetailLayout } from '@/components/AdminReadOnlyDetailLayout/AdminReadOnlyDetailLayout';

export function FaceProfileDetailPage() {
	const { faceId: faceIdParam, userId } = useParams<{ faceId: string; userId: string }>();
	const [search] = useSearchParams();
	const faceId = parseInt(faceIdParam ?? search.get('faceId') ?? '0', 10);
	const { t } = useTranslation('common');
	const { data, isLoading, isError, error } = useFaceProfile(faceId, userId ?? '');

	const fields = data
		? [
				{ label: t('pages.profileDetail.userId'), value: data.userId },
				{ label: t('pages.profileDetail.displayName'), value: data.displayName },
			]
		: [];

	return (
		<AdminReadOnlyDetailLayout
			title={data?.displayName ?? t('pages.profileDetail.title')}
			backFaceId={faceId}
			fields={fields}
			isLoading={isLoading}
			isError={isError}
			errorMessage={error instanceof Error ? error.message : undefined}
		/>
	);
}
