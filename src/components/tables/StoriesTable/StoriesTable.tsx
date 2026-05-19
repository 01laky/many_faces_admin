import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useStories, type StoryListItem } from '@/hooks/api/useStoriesApi';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { sortingStateToApi } from '@/utils/adminListQuery';
import { FaceDetailEntityTableShell } from '@/components/tables/FaceDetailEntityTableShell/FaceDetailEntityTableShell';

interface StoriesTableProps {
	faceId: number;
}

export function StoriesTable({ faceId }: StoriesTableProps) {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	});
	const { data, isLoading, isError, error, refetch } = useStories({
		faceId,
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		...sortingStateToApi(sorting),
	});

	const openDetail = (row: StoryListItem) => {
		navigate(getLocalizedPath(`/stories/${row.id}?faceId=${faceId}`));
	};

	const columns = useMemo<ColumnDef<StoryListItem>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				enableSorting: true,
				cell: ({ getValue }) => getValue(),
			},
			{ accessorKey: 'title', header: t('pages.storiesTable.colTitle'), enableSorting: true },
			{
				id: 'published',
				header: t('pages.storiesTable.colPublished'),
				cell: ({ row }) => (
					<span
						className={`badge ${row.original.isPublished ? 'text-bg-success' : 'text-bg-secondary'}`}
					>
						{row.original.isPublished
							? t('pages.storiesTable.published')
							: t('pages.storiesTable.draft')}
					</span>
				),
			},
			{
				accessorKey: 'createdAt',
				header: t('pages.storiesTable.colCreatedAt'),
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
			sectionTitle={t('pages.storiesTable.title')}
			emptyMessage={t('pages.storiesTable.noItems')}
			loadingMessage={t('pages.storiesTable.loading')}
			errorMessagePrefix={t('pages.storiesTable.error')}
			itemLabel={t('pages.storiesTable.title')}
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
