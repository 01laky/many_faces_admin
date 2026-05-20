import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import {
	useFaceVideoLounges,
	type FaceVideoLoungeListItem,
} from '@/hooks/api/useFaceVideoLoungesApi';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { sortingStateToApi } from '@/utils/adminListQuery';
import { FaceDetailEntityTableShell } from '@/components/tables/FaceDetailEntityTableShell/FaceDetailEntityTableShell';

interface FaceVideoLoungesTableProps {
	faceId: number;
}

function formatCellValue(value: number | undefined): string {
	if (value === null || value === undefined) return '—';
	return String(value);
}

export function FaceVideoLoungesTable({ faceId }: FaceVideoLoungesTableProps) {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	});
	const { data, isLoading, isError, error, refetch } = useFaceVideoLounges({
		faceId,
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		...sortingStateToApi(sorting),
	});

	const openDetail = (row: FaceVideoLoungeListItem) => {
		navigate(getLocalizedPath(`/faces/${faceId}/video-lounges/${row.id}?faceId=${faceId}`));
	};

	const columns = useMemo<ColumnDef<FaceVideoLoungeListItem>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				enableSorting: true,
				cell: ({ getValue }) => getValue(),
			},
			{ accessorKey: 'title', header: t('pages.videoLoungesTable.colTitle'), enableSorting: true },
			{
				id: 'public',
				header: t('pages.videoLoungesTable.colPublic'),
				cell: ({ row }) => (
					<span
						className={`badge ${row.original.isPublic ? 'text-bg-primary' : 'text-bg-secondary'}`}
					>
						{row.original.isPublic
							? t('pages.videoLoungesTable.public')
							: t('pages.videoLoungesTable.private')}
					</span>
				),
			},
			{
				id: 'system',
				header: t('pages.videoLoungesTable.colSystem'),
				cell: ({ row }) =>
					row.original.isSystemManaged ? (
						<span className="badge text-bg-info">{t('pages.videoLoungesTable.system')}</span>
					) : (
						'—'
					),
			},
			{
				accessorKey: 'memberCount',
				header: t('pages.videoLoungesTable.colMembers'),
				enableSorting: false,
				cell: ({ getValue }) => formatCellValue(getValue() as number | undefined),
			},
			{
				id: 'live',
				header: t('pages.videoLoungesTable.colLive'),
				cell: ({ row }) =>
					row.original.hasLiveSession ? (
						<span className="badge text-bg-danger">
							{t('pages.videoLoungesTable.liveBadge', {
								count: row.original.liveParticipantCount ?? 0,
							})}
						</span>
					) : (
						'—'
					),
			},
			{
				accessorKey: 'createdAt',
				header: t('pages.videoLoungesTable.colCreatedAt'),
				enableSorting: true,
				cell: ({ getValue }) => {
					const v = getValue() as string | undefined;
					return v ? new Date(v).toLocaleString() : '—';
				},
			},
		],
		[t]
	);

	return (
		<FaceDetailEntityTableShell
			sectionTitle={t('pages.videoLoungesTable.title')}
			emptyMessage={t('pages.videoLoungesTable.noItems')}
			loadingMessage={t('pages.videoLoungesTable.loading')}
			errorMessagePrefix={t('pages.videoLoungesTable.error')}
			itemLabel={t('pages.videoLoungesTable.title')}
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
			onRowClick={openDetail}
		/>
	);
}
