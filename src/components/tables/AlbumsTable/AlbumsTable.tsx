import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAlbums, type AlbumListItem } from '@/hooks/api/useAlbumsApi';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { sortingStateToApi } from '@/utils/adminListQuery';
import { getModerationQueueLabel } from '@/utils/contentModeration';
import { FaceDetailEntityTableShell } from '@/components/tables/FaceDetailEntityTableShell/FaceDetailEntityTableShell';

interface AlbumsTableProps {
	faceId: number;
}

export function AlbumsTable({ faceId }: AlbumsTableProps) {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	});

	const { data, isLoading, isError, error, refetch } = useAlbums({
		faceId,
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		...sortingStateToApi(sorting),
	});

	const columns = useMemo<ColumnDef<AlbumListItem>[]>(
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
							navigate(getLocalizedPath(`/albums/${row.original.id}?faceId=${faceId}`))
						}
					>
						{row.original.id}
					</button>
				),
			},
			{ accessorKey: 'title', header: t('pages.albumsTable.colTitle'), enableSorting: true },
			{
				id: 'approval',
				header: t('pages.albumsTable.colApproval'),
				cell: ({ row }) => {
					const label = getModerationQueueLabel(
						row.original.approvalStatus,
						row.original.aiReviewStatus
					);
					return <span className="badge bg-secondary">{label}</span>;
				},
			},
			{
				id: 'creator',
				header: t('pages.albumsTable.colCreator'),
				cell: ({ row }) =>
					row.original.creatorId ? (
						<Link to={getLocalizedPath(`/users/${row.original.creatorId}`)}>
							{row.original.creatorName || row.original.creatorId}
						</Link>
					) : (
						'—'
					),
			},
			{
				accessorKey: 'createdAt',
				header: t('pages.albumsTable.colCreatedAt'),
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
			sectionTitle={t('pages.albumsTable.title')}
			emptyMessage={t('pages.albumsTable.noAlbums')}
			loadingMessage={t('pages.albumsTable.loading')}
			errorMessagePrefix={t('pages.albumsTable.error')}
			itemLabel={t('pages.albumsTable.title')}
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
