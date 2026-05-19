import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useFaceChatRooms, type FaceChatRoomListItem } from '@/hooks/api/useFaceChatRoomsApi';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { sortingStateToApi } from '@/utils/adminListQuery';
import { FaceDetailEntityTableShell } from '@/components/tables/FaceDetailEntityTableShell/FaceDetailEntityTableShell';

interface FaceChatRoomsTableProps {
	faceId: number;
}

export function FaceChatRoomsTable({ faceId }: FaceChatRoomsTableProps) {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	});
	const { data, isLoading, isError, error, refetch } = useFaceChatRooms({
		faceId,
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		...sortingStateToApi(sorting),
	});
	const columns = useMemo<ColumnDef<FaceChatRoomListItem>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				enableSorting: true,
				cell: ({ row }) => (
					<button
						type="button"
						className="table-link-button"
						onClick={() =>
							navigate(
								getLocalizedPath(`/faces/${faceId}/chat-rooms/${row.original.id}?faceId=${faceId}`)
							)
						}
					>
						{row.original.id}
					</button>
				),
			},
			{ accessorKey: 'title', header: t('pages.chatRoomsTable.colTitle'), enableSorting: true },
			{
				id: 'public',
				header: t('pages.chatRoomsTable.colPublic'),
				cell: ({ row }) =>
					row.original.isPublic
						? t('pages.chatRoomsTable.public')
						: t('pages.chatRoomsTable.private'),
			},
			{
				id: 'system',
				header: t('pages.chatRoomsTable.colSystem'),
				cell: ({ row }) => (row.original.isSystemManaged ? t('pages.chatRoomsTable.system') : '—'),
			},
			{
				accessorKey: 'createdAt',
				header: t('pages.chatRoomsTable.colCreatedAt'),
				enableSorting: true,
				cell: ({ getValue }) => {
					const v = getValue() as string | undefined;
					return v ? new Date(v).toLocaleString() : '—';
				},
			},
		],
		[faceId, getLocalizedPath, navigate, t]
	);
	return (
		<FaceDetailEntityTableShell
			sectionTitle={t('pages.chatRoomsTable.title')}
			emptyMessage={t('pages.chatRoomsTable.noItems')}
			loadingMessage={t('pages.chatRoomsTable.loading')}
			errorMessagePrefix={t('pages.chatRoomsTable.error')}
			itemLabel={t('pages.chatRoomsTable.title')}
			columns={columns}
			data={data?.items ?? []}
			totalCount={data?.totalCount ?? 0}
			totalPages={data?.totalPages ?? 0}
			isLoading={isLoading}
			isError={isError}
			error={error}
			refetch={() => void refetch()}
			sorting={sorting}
			onSortingChange={setSorting}
			pagination={pagination}
			onPaginationChange={setPagination}
		/>
	);
}
