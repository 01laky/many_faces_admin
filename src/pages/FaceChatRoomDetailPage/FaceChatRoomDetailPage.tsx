import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFaceChatRoom } from '@/hooks/api/useFaceChatRoomsApi';
import { AdminReadOnlyDetailLayout } from '@/components/AdminReadOnlyDetailLayout/AdminReadOnlyDetailLayout';

export function FaceChatRoomDetailPage() {
	const { faceId: faceIdParam, roomId } = useParams<{ faceId: string; roomId: string }>();
	const [search] = useSearchParams();
	const faceId = parseInt(faceIdParam ?? search.get('faceId') ?? '0', 10);
	const chatRoomId = roomId ? parseInt(roomId, 10) : 0;
	const { t } = useTranslation('common');
	const { data, isLoading, isError, error } = useFaceChatRoom(faceId, chatRoomId);

	const fields = data
		? [
				{ label: 'ID', value: data.id },
				{ label: t('pages.chatRoomDetail.title'), value: data.title },
				{ label: t('pages.chatRoomDetail.description'), value: data.description },
				{
					label: t('pages.chatRoomDetail.isPublic'),
					value: data.isPublic
						? t('pages.chatRoomsTable.public')
						: t('pages.chatRoomsTable.private'),
				},
			]
		: [];

	return (
		<AdminReadOnlyDetailLayout
			title={data?.title ?? t('pages.chatRoomDetail.title')}
			backFaceId={faceId}
			fields={fields}
			isLoading={isLoading}
			isError={isError}
			errorMessage={error instanceof Error ? error.message : undefined}
		/>
	);
}
