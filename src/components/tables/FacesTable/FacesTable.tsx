import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useFaces, type Face } from '@/hooks/api/useFacesApi';
import { Button } from '@/components/radix/Button';
import { Input } from '@/components/radix/Input';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { gradientPreviewStyle } from '@/utils/gradientPreview';
import { isAdminScopeFace } from '@/utils/adminScopeFace';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { sortingStateToApi } from '@/utils/adminListQuery';
import { stopAdminTableRowNavigation } from '@/utils/adminTableRowClick';
import { FaceDetailEntityTableShell } from '@/components/tables/FaceDetailEntityTableShell/FaceDetailEntityTableShell';
import './FacesTable.scss';

export function FacesTable() {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	});

	useEffect(() => {
		const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
		return () => window.clearTimeout(timer);
	}, [search]);

	const { data, isLoading, isError, error, refetch } = useFaces({
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		search: debouncedSearch || undefined,
		...sortingStateToApi(sorting),
	});

	const columns = useMemo<ColumnDef<Face>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				enableSorting: true,
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'index',
				header: t('pages.faceDetail.index'),
				enableSorting: true,
			},
			{
				accessorKey: 'title',
				header: t('pages.faceDetail.faceTitle'),
				enableSorting: true,
			},
			{
				accessorKey: 'description',
				header: t('pages.faceDetail.description'),
				enableSorting: false,
				cell: (info) => {
					const desc = info.getValue() as string | undefined;
					return desc ? (desc.length > 50 ? `${desc.substring(0, 50)}...` : desc) : '—';
				},
			},
			{
				accessorKey: 'gradientSettings',
				header: t('pages.faceDetail.gradient'),
				enableSorting: false,
				cell: (info) => {
					const raw = info.getValue() as string | null | undefined;
					if (!raw) return '—';
					return (
						<span
							className="faces-table__gradient-swatch"
							style={gradientPreviewStyle(raw)}
							title={raw.length > 120 ? `${raw.slice(0, 120)}…` : raw}
						/>
					);
				},
			},
			{
				accessorKey: 'isPublic',
				header: t('pages.faceDetail.isPublic'),
				enableSorting: true,
				cell: (info) => {
					const isPublic = info.getValue() as boolean | undefined;
					return (
						<span className={`badge ${isPublic ? 'text-bg-success' : 'text-bg-warning'}`}>
							{isPublic ? t('pages.faceDetail.public') : t('pages.faceDetail.private')}
						</span>
					);
				},
			},
			{
				id: 'actions',
				header: t('common.actions'),
				enableSorting: false,
				cell: (info) => {
					const face = info.row.original;
					if (isAdminScopeFace(face)) {
						return (
							<span className="text-muted" title={t('pages.faces.adminScopeReadOnly')}>
								—
							</span>
						);
					}
					return (
						<div
							className="admin-data-table__cell-interactive"
							onClick={stopAdminTableRowNavigation}
							onKeyDown={stopAdminTableRowNavigation}
							role="presentation"
						>
							<Button
								variant="outline"
								onClick={() => navigate(getLocalizedPath(`/faces/${face.id}/edit`))}
							>
								{t('common.edit')}
							</Button>
						</div>
					);
				},
			},
		],
		[t, navigate, getLocalizedPath]
	);

	const headerToolbar = (
		<div className="admin-data-table-section__toolbar">
			<Input
				type="text"
				placeholder={t('pages.faces.searchPlaceholder')}
				value={search}
				onChange={(e) => {
					setSearch(e.target.value);
					setPagination((prev) => ({ ...prev, pageIndex: 0 }));
				}}
				className="admin-data-table-section__search"
			/>
			<Button onClick={() => void refetch()}>{t('common.refresh')}</Button>
			<Button onClick={() => navigate(getLocalizedPath('/faces/create'))}>
				{t('pages.faces.create')}
			</Button>
		</div>
	);

	return (
		<FaceDetailEntityTableShell
			sectionClassName="admin-data-table-section--page-root"
			sectionTitle={t('pages.faces.title')}
			emptyMessage={t('pages.faces.noFaces')}
			loadingMessage={t('pages.faces.loading')}
			errorMessagePrefix={t('pages.faces.error')}
			itemLabel={t('pages.faces.faces')}
			columns={columns}
			data={data?.faces ?? []}
			totalCount={data?.total ?? 0}
			totalPages={data?.totalPages ?? 0}
			isLoading={isLoading}
			isError={isError}
			error={error}
			refetch={() => void refetch()}
			sorting={sorting}
			onSortingChange={setSorting}
			pagination={pagination}
			onPaginationChange={setPagination}
			headerActions={headerToolbar}
			onRowClick={(face) => navigate(getLocalizedPath(`/faces/${face.id}`))}
			isRowClickable={(face) => !isAdminScopeFace(face)}
		/>
	);
}
