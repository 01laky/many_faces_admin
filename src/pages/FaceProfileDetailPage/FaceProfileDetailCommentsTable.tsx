import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import {
	useFaceProfileComments,
	type FaceProfileCommentItem,
} from '@/hooks/api/useFaceProfilesApi';
import { Button } from '@/components/radix/Button';
import { Input } from '@/components/radix/Input';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { sortingStateToApi } from '@/utils/adminListQuery';
import { PROFILE_DETAIL_TEST_IDS } from '@/utils/faceProfileDetailUi';
import { FaceDetailEntityTableShell } from '@/components/tables/FaceDetailEntityTableShell/FaceDetailEntityTableShell';

import type { FaceProfileDetailCommentsTableProps } from './types';

function formatDate(value: string | undefined): string {
	if (!value) return '—';
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

function truncateBody(body: string, max = 120): string {
	const t = body.trim();
	if (t.length <= max) return t;
	return `${t.slice(0, max)}…`;
}

export function FaceProfileDetailCommentsTable({
	faceId,
	userId,
	isSuperAdmin,
	onDeleteComment,
}: FaceProfileDetailCommentsTableProps) {
	const { t } = useTranslation('common');
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
	const [search, setSearch] = useState('');
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	});

	const listParams = {
		faceId,
		userId,
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		search: search.trim() || undefined,
		...sortingStateToApi(sorting),
	};

	const { data, isLoading, isError, error, refetch } = useFaceProfileComments(listParams);

	const columns = useMemo<ColumnDef<FaceProfileCommentItem>[]>(() => {
		const cols: ColumnDef<FaceProfileCommentItem>[] = [
			{
				accessorKey: 'id',
				header: t('pages.profileDetail.colCommentId'),
				enableSorting: true,
			},
			{
				accessorKey: 'userId',
				header: t('pages.profileDetail.colAuthor'),
				enableSorting: true,
				cell: ({ row }) => (
					<Link
						to={getLocalizedPath(`/users/${row.original.userId}`)}
						onClick={(e) => e.stopPropagation()}
					>
						{row.original.authorDisplayName?.trim() || row.original.userId}
					</Link>
				),
			},
			{
				accessorKey: 'body',
				header: t('pages.profileDetail.colBody'),
				enableSorting: false,
				cell: ({ row }) => (
					<span style={{ whiteSpace: 'pre-wrap' }} title={row.original.body}>
						{truncateBody(row.original.body)}
					</span>
				),
			},
			{
				accessorKey: 'createdAt',
				header: t('pages.profileDetail.colCreatedAt'),
				enableSorting: true,
				cell: ({ getValue }) => formatDate(getValue() as string | undefined),
			},
		];
		if (isSuperAdmin) {
			cols.push({
				id: 'actions',
				header: '',
				enableSorting: false,
				cell: ({ row }) => (
					<Button
						variant="outline"
						size="sm"
						onClick={(e) => {
							e.stopPropagation();
							onDeleteComment(row.original.id);
						}}
					>
						{t('common.delete')}
					</Button>
				),
			});
		}
		return cols;
	}, [getLocalizedPath, isSuperAdmin, onDeleteComment, t]);

	const toolbar = (
		<div className="admin-data-table-section__toolbar">
			<Input
				type="text"
				placeholder={t('pages.profileDetail.commentsSearchPlaceholder')}
				value={search}
				onChange={(e) => {
					setSearch(e.target.value);
					setPagination((prev) => ({ ...prev, pageIndex: 0 }));
				}}
				className="admin-data-table-section__search"
			/>
			<Button onClick={() => void refetch()}>{t('common.refresh')}</Button>
		</div>
	);

	return (
		<div data-testid={PROFILE_DETAIL_TEST_IDS.comments}>
			<FaceDetailEntityTableShell
				sectionTitle={t('pages.profileDetail.commentsSection')}
				emptyMessage={t('pages.profileDetail.commentsEmpty')}
				loadingMessage={t('common.loading')}
				errorMessagePrefix={t('pages.profilesTable.error')}
				itemLabel={t('pages.profileDetail.commentsSection')}
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
				extraFilters={toolbar}
			/>
		</div>
	);
}
