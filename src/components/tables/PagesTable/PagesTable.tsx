import { useCallback, useMemo, useState } from 'react';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePages, useDeletePage, type Page } from '@/hooks/api/usePagesApi';
import { usePageTypes } from '@/hooks/api/usePageTypesApi';
import { Button } from '@/components/radix/Button';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { toast } from 'react-toastify';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { sortingStateToApi } from '@/utils/adminListQuery';
import { stopAdminTableRowNavigation } from '@/utils/adminTableRowClick';
import { FaceDetailEntityTableShell } from '@/components/tables/FaceDetailEntityTableShell/FaceDetailEntityTableShell';
import type { PagesTableProps } from './types';

export function PagesTable({ faceId }: PagesTableProps) {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([{ id: 'index', desc: false }]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	});

	const apiSort = sortingStateToApi(sorting);
	const { data, isLoading, error, isError, refetch } = usePages({
		faceId,
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		...apiSort,
	});

	const deletePageMutation = useDeletePage();
	const { data: pageTypes = [] } = usePageTypes();
	const profileDetailTypeId = pageTypes.find((pt) => pt.index === 'profileDetail')?.id;

	const handleDelete = useCallback(
		(id: number) => {
			if (window.confirm(t('pages.pagesTable.confirmDelete'))) {
				deletePageMutation.mutate(
					{ id, faceId },
					{
						onSuccess: () => toast.success(t('pages.pagesTable.deleteSuccess')),
						onError: (err: Error) => toast.error(err.message || t('pages.pagesTable.deleteError')),
					}
				);
			}
		},
		[t, deletePageMutation, faceId]
	);

	const openDetail = useCallback(
		(page: Page) => {
			navigate(getLocalizedPath(`/pages/${page.id}`));
		},
		[navigate, getLocalizedPath]
	);

	const columns = useMemo<ColumnDef<Page>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				enableSorting: true,
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'name',
				header: t('pages.pageDetail.name'),
				enableSorting: true,
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'path',
				header: t('pages.pageDetail.path'),
				enableSorting: true,
				cell: (info) => <span className="font-monospace small">{String(info.getValue())}</span>,
			},
			{
				accessorKey: 'index',
				header: t('pages.pageDetail.index'),
				enableSorting: true,
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'description',
				header: t('pages.pageDetail.description'),
				enableSorting: false,
				cell: (info) => {
					const desc = info.getValue() as string | undefined;
					return desc ? (desc.length > 50 ? `${desc.substring(0, 50)}...` : desc) : '—';
				},
			},
			{
				id: 'actions',
				header: t('common.actions'),
				enableSorting: false,
				cell: (info) => {
					const pageId = info.row.original.id;
					const isProfileTemplate =
						profileDetailTypeId != null && info.row.original.pageTypeId === profileDetailTypeId;
					return (
						<div
							className="admin-data-table__cell-interactive"
							onClick={stopAdminTableRowNavigation}
							onKeyDown={stopAdminTableRowNavigation}
							role="presentation"
						>
							<Button
								variant="outline"
								onClick={() => navigate(getLocalizedPath(`/pages/${pageId}/edit`))}
							>
								{t('common.edit')}
							</Button>
							<Button
								variant="danger"
								onClick={() => handleDelete(pageId)}
								disabled={deletePageMutation.isPending || isProfileTemplate}
								title={
									isProfileTemplate ? t('pages.profileDetailTemplate.deleteDisabled') : undefined
								}
							>
								{t('common.delete')}
							</Button>
						</div>
					);
				},
			},
		],
		[t, navigate, getLocalizedPath, deletePageMutation.isPending, handleDelete, profileDetailTypeId]
	);

	const handleCreateClick = () => {
		navigate(getLocalizedPath(`/faces/${faceId}/pages/create`));
	};

	const showError =
		error &&
		!isLoading &&
		!(
			error instanceof Error &&
			(error.message.includes('Not Found') || error.message.includes('404'))
		);

	return (
		<FaceDetailEntityTableShell
			sectionTitle={t('pages.pagesTable.title')}
			emptyMessage={t('pages.pagesTable.noPages')}
			loadingMessage={t('pages.pagesTable.loading')}
			errorMessagePrefix={t('pages.pagesTable.error')}
			itemLabel={t('pages.pagesTable.title')}
			columns={columns}
			data={data?.items ?? []}
			totalCount={data?.totalCount ?? 0}
			totalPages={data?.totalPages ?? 0}
			isLoading={isLoading}
			isError={showError ? isError : false}
			error={showError ? error : undefined}
			refetch={() => void refetch()}
			sorting={sorting}
			onSortingChange={setSorting}
			pagination={pagination}
			onPaginationChange={setPagination}
			onRowClick={openDetail}
			headerActions={<Button onClick={handleCreateClick}>{t('pages.pagesTable.create')}</Button>}
		/>
	);
}
