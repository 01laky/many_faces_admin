import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	type ColumnDef,
	type SortingState,
	type ColumnFiltersState,
	flexRender,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useFaces, type Face } from '@/hooks/api/useFacesApi';
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHeaderCell,
	TableCell,
} from '@/components/radix/Table';
import { Button } from '@/components/radix/Button';
import { Input } from '@/components/radix/Input';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { gradientPreviewStyle } from '@/utils/gradientPreview';
import { isAdminScopeFace } from '@/utils/adminScopeFace';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { AdminTablePagination } from '@/components/tables/AdminTablePagination';
import './FacesTable.scss';

export function FacesTable() {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [search, setSearch] = useState('');
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	});

	useEffect(() => {
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	}, [search]);

	const { data, isLoading, error, refetch } = useFaces({
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		search: search || undefined,
	});

	// Define columns
	const columns = useMemo<ColumnDef<Face>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				enableSorting: true,
				cell: (info) => {
					const face = info.row.original;
					const id = info.getValue() as number;
					if (isAdminScopeFace(face)) {
						return <span>{id}</span>;
					}
					return (
						<button
							type="button"
							className="table-link-button"
							onClick={() => navigate(getLocalizedPath(`/faces/${id}`))}
						>
							{id}
						</button>
					);
				},
			},
			{
				accessorKey: 'index',
				header: t('pages.faceDetail.index'),
				enableSorting: true,
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'title',
				header: t('pages.faceDetail.faceTitle'),
				enableSorting: true,
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'description',
				header: t('pages.faceDetail.description'),
				enableSorting: false,
				cell: (info) => {
					const desc = info.getValue() as string | undefined;
					return desc ? (desc.length > 50 ? `${desc.substring(0, 50)}...` : desc) : '-';
				},
			},
			{
				accessorKey: 'gradientSettings',
				header: t('pages.faceDetail.gradient'),
				enableSorting: false,
				cell: (info) => {
					const raw = info.getValue() as string | null | undefined;
					if (!raw) return '-';
					return (
						<span
							className="gradient-preview-swatch"
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
						<span className={`badge ${isPublic ? 'bg-success' : 'bg-warning text-dark'}`}>
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
						<div className="table-actions">
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

	// Get faces data - handle empty state gracefully
	const faces = data?.faces || [];

	/*
	 * TanStack Table's `useReactTable` returns an object full of functions whose identities change
	 * across renders. React Compiler's `react-hooks/incompatible-library` rule flags that: if this
	 * hook were memoized like a "pure" hook, downstream memoized children could capture stale row APIs.
	 *
	 * In this component we only feed `table` into local JSX (row models, headers, pagination). We do
	 * not pass unstable table methods across a memo boundary into other components, so skipping compiler
	 * memoization for this call site is the intended trade-off documented upstream for TanStack Table.
	 */
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table; rationale in block comment above
	const table = useReactTable({
		data: faces,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
			columnFilters,
			pagination,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onPaginationChange: setPagination,
		manualPagination: true,
		manualSorting: false,
		manualFiltering: false,
		pageCount: data
			? Math.max(1, Math.ceil(data.total / (data.pageSize || ADMIN_TABLE_PAGE_SIZE)))
			: 1,
	});

	if (isLoading) {
		return (
			<div className="faces-table-loading">
				<p>{t('pages.faces.loading')}</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="faces-table-error">
				<p>
					{t('pages.faces.error')}: {error instanceof Error ? error.message : 'Unknown error'}
				</p>
				<Button onClick={() => refetch()}>{t('common.retry')}</Button>
			</div>
		);
	}

	const handleCreateClick = () => {
		navigate(getLocalizedPath('/faces/create'));
	};

	return (
		<div className="faces-table-container">
			<div className="faces-table-header">
				<h2>{t('pages.faces.title')}</h2>
				<div className="faces-table-actions">
					<Input
						type="text"
						placeholder={t('pages.faces.searchPlaceholder')}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="faces-table-search"
					/>
					<Button onClick={() => refetch()}>{t('common.refresh')}</Button>
					<Button onClick={handleCreateClick}>{t('pages.faces.create')}</Button>
				</div>
			</div>

			<div className="faces-table-wrapper">
				<Table variant="surface" size="2" className="faces-table">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHeaderCell
										key={header.id}
										data-sortable={header.column.getCanSort() ? '' : undefined}
										onClick={header.column.getToggleSortingHandler()}
										style={{
											cursor: header.column.getCanSort() ? 'pointer' : 'default',
										}}
									>
										<div className="table-header-content">
											{flexRender(header.column.columnDef.header, header.getContext())}
											{header.column.getIsSorted() && (
												<span className="table-sort-icon">
													{header.column.getIsSorted() === 'desc' ? ' ↓' : ' ↑'}
												</span>
											)}
										</div>
									</TableHeaderCell>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									style={{ textAlign: 'center', padding: '2rem' }}
								>
									{t('pages.faces.noFaces')}
								</TableCell>
							</TableRow>
						) : (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<AdminTablePagination
				table={table}
				totalItems={data?.total ?? 0}
				itemLabel={t('pages.faces.faces')}
				className="faces-table-pagination"
			/>
		</div>
	);
}
