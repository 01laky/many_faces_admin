import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useFaceProfiles, type FaceProfileListItem } from '@/hooks/api/useFaceProfilesApi';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { sortingStateToApi } from '@/utils/adminListQuery';
import { FaceDetailEntityTableShell } from '@/components/tables/FaceDetailEntityTableShell/FaceDetailEntityTableShell';
import type { FaceProfilesTableProps } from './types';

export function FaceProfilesTable({ faceId }: FaceProfilesTableProps) {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([{ id: 'displayName', desc: false }]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	});
	const { data, isLoading, isError, error, refetch } = useFaceProfiles({
		faceId,
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		...sortingStateToApi(sorting),
	});

	const openDetail = (row: FaceProfileListItem) => {
		navigate(
			getLocalizedPath(
				`/faces/${faceId}/profiles/${encodeURIComponent(row.userId)}?faceId=${faceId}`
			)
		);
	};

	const columns = useMemo<ColumnDef<FaceProfileListItem>[]>(
		() => [
			{
				accessorKey: 'userId',
				header: t('pages.profilesTable.colUserId'),
				enableSorting: true,
				cell: ({ getValue }) => <span className="font-monospace small">{String(getValue())}</span>,
			},
			{
				accessorKey: 'displayName',
				header: t('pages.profilesTable.colDisplayName'),
				enableSorting: true,
			},
			{
				accessorKey: 'commentsCount',
				header: t('pages.profilesTable.colComments'),
				enableSorting: false,
			},
			{
				accessorKey: 'likesCount',
				header: t('pages.profilesTable.colLikes'),
				enableSorting: false,
			},
			{
				accessorKey: 'reviewsCount',
				header: t('pages.profilesTable.colReviews'),
				enableSorting: false,
			},
		],
		[t]
	);

	return (
		<FaceDetailEntityTableShell
			sectionTitle={t('pages.profilesTable.title')}
			emptyMessage={t('pages.profilesTable.noItems')}
			loadingMessage={t('pages.profilesTable.loading')}
			errorMessagePrefix={t('pages.profilesTable.error')}
			itemLabel={t('pages.profilesTable.title')}
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
