import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useStories, type StoryListItem } from '@/hooks/api/useStoriesApi';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { sortingStateToApi } from '@/utils/adminListQuery';
import { stopAdminTableRowNavigation } from '@/utils/adminTableRowClick';
import { FaceDetailEntityTableShell } from '@/components/tables/FaceDetailEntityTableShell/FaceDetailEntityTableShell';
import type { StoriesTableProps, PublishedFilter } from './types';

export function StoriesTable({ faceId }: StoriesTableProps) {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	});
	const [publishedFilter, setPublishedFilter] = useState<PublishedFilter>('all');

	const isPublishedParam = publishedFilter === 'all' ? undefined : publishedFilter === 'published';

	const { data, isLoading, isError, error, refetch } = useStories({
		faceId,
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		isPublished: isPublishedParam,
		...sortingStateToApi(sorting),
	});

	const openDetail = (row: StoryListItem) => {
		navigate(getLocalizedPath(`/stories/${row.id}?faceId=${faceId}`));
	};

	const toolbar = (
		<Form.Select
			size="sm"
			style={{ maxWidth: '12rem' }}
			value={publishedFilter}
			onChange={(e) => {
				setPublishedFilter(e.target.value as PublishedFilter);
				setPagination((p) => ({ ...p, pageIndex: 0 }));
			}}
			aria-label={t('pages.storiesTable.filterPublished')}
		>
			<option value="all">{t('pages.storiesTable.filterAll')}</option>
			<option value="published">{t('pages.storiesTable.filterPublished')}</option>
			<option value="draft">{t('pages.storiesTable.filterDraft')}</option>
		</Form.Select>
	);

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
				accessorKey: 'imageCount',
				header: t('pages.storiesTable.colImageCount'),
				cell: ({ getValue }) => getValue() ?? 0,
			},
			{
				id: 'state',
				header: t('pages.storyDetail.state'),
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
				accessorKey: 'expiresAt',
				header: t('pages.storiesTable.colExpiresAt'),
				enableSorting: true,
				cell: ({ getValue }) => {
					const v = getValue() as string | undefined;
					return v ? new Date(v).toLocaleString() : '—';
				},
			},
			{
				id: 'creator',
				header: t('pages.storiesTable.colCreator'),
				cell: ({ row }) => {
					const cid = row.original.creatorId;
					if (!cid) return row.original.creatorName ?? '—';
					return (
						<Link
							to={getLocalizedPath(`/users/${cid}`)}
							className="link-primary"
							onClick={stopAdminTableRowNavigation}
						>
							{row.original.creatorName || cid}
						</Link>
					);
				},
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
		[t, getLocalizedPath]
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
			extraFilters={toolbar}
		/>
	);
}
