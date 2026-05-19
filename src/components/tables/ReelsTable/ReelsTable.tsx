import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useReels, type ReelsListItem } from '@/hooks/api/useReelsApi';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { sortingStateToApi } from '@/utils/adminListQuery';
import { getModerationQueueLabel } from '@/utils/contentModeration';
import { FaceDetailEntityTableShell } from '@/components/tables/FaceDetailEntityTableShell/FaceDetailEntityTableShell';

interface ReelsTableProps {
	faceId: number;
}

export function ReelsTable({ faceId }: ReelsTableProps) {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	});
	const { data, isLoading, isError, error, refetch } = useReels({
		faceId,
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		...sortingStateToApi(sorting),
	});
	const columns = useMemo<ColumnDef<ReelsListItem>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				enableSorting: true,
				cell: ({ row }) => (
					<button
						type="button"
						className="table-link-button"
						onClick={() => navigate(getLocalizedPath(`/reels/${row.original.id}?faceId=${faceId}`))}
					>
						{row.original.id}
					</button>
				),
			},
			{ accessorKey: 'title', header: t('pages.reelsTable.colTitle'), enableSorting: true },
			{
				id: 'approval',
				header: t('pages.reelsTable.colApproval'),
				cell: ({ row }) => (
					<span className="badge bg-secondary">
						{getModerationQueueLabel(row.original.approvalStatus, row.original.aiReviewStatus)}
					</span>
				),
			},
			{
				id: 'creator',
				header: t('pages.reelsTable.colCreator'),
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
				header: t('pages.reelsTable.colCreatedAt'),
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
			sectionTitle={t('pages.reelsTable.title')}
			emptyMessage={t('pages.reelsTable.noItems')}
			loadingMessage={t('pages.reelsTable.loading')}
			errorMessagePrefix={t('pages.reelsTable.error')}
			itemLabel={t('pages.reelsTable.title')}
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
