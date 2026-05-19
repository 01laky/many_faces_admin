import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useBlogs, type BlogListItem } from '@/hooks/api/useBlogsApi';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { sortingStateToApi } from '@/utils/adminListQuery';
import { getModerationQueueLabel } from '@/utils/contentModeration';
import { FaceDetailEntityTableShell } from '@/components/tables/FaceDetailEntityTableShell/FaceDetailEntityTableShell';

export interface UserDetailBlogsTableProps {
	creatorId: string;
}

export function UserDetailBlogsTable({ creatorId }: UserDetailBlogsTableProps) {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	});

	const { data, isLoading, isError, error, refetch } = useBlogs({
		creatorId,
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		...sortingStateToApi(sorting),
	});

	const openDetail = (row: BlogListItem) => {
		const fid = row.faceId ?? 0;
		if (fid <= 0) return;
		navigate(getLocalizedPath(`/blogs/${row.id}?faceId=${fid}`));
	};

	const columns = useMemo<ColumnDef<BlogListItem>[]>(
		() => [
			{ accessorKey: 'id', header: 'ID', enableSorting: true },
			{ accessorKey: 'title', header: t('pages.blogsTable.colTitle'), enableSorting: true },
			{
				id: 'face',
				header: t('pages.userDetail.blogsColFace'),
				cell: ({ row }) => row.original.faceTitle ?? row.original.faceId ?? '—',
			},
			{
				accessorKey: 'imageCount',
				header: t('pages.blogsTable.colImages'),
				cell: ({ getValue }) => getValue() ?? 0,
			},
			{
				id: 'approval',
				header: t('pages.blogsTable.colApproval'),
				cell: ({ row }) => {
					const label = getModerationQueueLabel(
						row.original.approvalStatus,
						row.original.aiReviewStatus
					);
					return <span className="badge text-bg-secondary">{label}</span>;
				},
			},
			{
				accessorKey: 'createdAt',
				header: t('pages.blogsTable.colCreatedAt'),
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
			sectionTitle={t('pages.userDetail.blogsTitle')}
			emptyMessage={t('pages.userDetail.blogsEmpty')}
			loadingMessage={t('pages.blogsTable.loading')}
			errorMessagePrefix={t('pages.blogsTable.error')}
			itemLabel={t('pages.userDetail.blogsTitle')}
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
