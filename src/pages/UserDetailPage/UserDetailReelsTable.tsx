import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useReels, type ReelListItem } from '@/hooks/api/useReelsApi';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { sortingStateToApi } from '@/utils/adminListQuery';
import { getModerationQueueLabel } from '@/utils/contentModeration';
import { resolveReelDetailFaceId } from '@/utils/reelDetailPaths';
import { FaceDetailEntityTableShell } from '@/components/tables/FaceDetailEntityTableShell/FaceDetailEntityTableShell';

import type { UserDetailReelsTableProps } from './types';

export function UserDetailReelsTable({ creatorId, userFaceIds }: UserDetailReelsTableProps) {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	});

	const { data, isLoading, isError, error, refetch } = useReels({
		creatorId,
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		...sortingStateToApi(sorting),
	});

	const openDetail = (row: ReelListItem) => {
		const faceId = resolveReelDetailFaceId(row, userFaceIds);
		if (faceId <= 0) return;
		navigate(getLocalizedPath(`/reels/${row.id}?faceId=${faceId}`));
	};

	const columns = useMemo<ColumnDef<ReelListItem>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				enableSorting: true,
				cell: ({ getValue }) => getValue(),
			},
			{ accessorKey: 'title', header: t('pages.reelsTable.colTitle'), enableSorting: true },
			{
				id: 'approval',
				header: t('pages.reelsTable.colApproval'),
				cell: ({ row }) => {
					const label = getModerationQueueLabel(
						row.original.approvalStatus,
						row.original.aiReviewStatus
					);
					return <span className="badge text-bg-secondary">{label}</span>;
				},
			},
			{
				id: 'faces',
				header: t('pages.userDetail.reelsColFaces'),
				cell: ({ row }) => {
					const labels = row.original.faces?.map((f) => f.title).filter(Boolean) ?? [];
					return labels.length > 0 ? labels.join(', ') : '—';
				},
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
		[t]
	);

	return (
		<FaceDetailEntityTableShell
			sectionTitle={t('pages.userDetail.reelsTitle')}
			emptyMessage={t('pages.userDetail.reelsEmpty')}
			loadingMessage={t('pages.reelsTable.loading')}
			errorMessagePrefix={t('pages.reelsTable.error')}
			itemLabel={t('pages.userDetail.reelsTitle')}
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
