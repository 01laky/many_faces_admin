import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	type ColumnDef,
	type SortingState,
	type ColumnFiltersState,
	flexRender,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useFaces, type Face } from '../hooks/api/useFacesApi';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from './radix/Table';
import { Button } from './radix/Button';
import { Input } from './radix/Input';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import './FacesTable.scss';

export function FacesTable() {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [search, setSearch] = useState('');

	// React Query hook
	const { data, isLoading, error, refetch } = useFaces({
		page: 1,
		pageSize: 10,
		search: search || undefined,
	});

	// Define columns
	const columns = useMemo<ColumnDef<Face>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				enableSorting: true,
				cell: (info) => (
					<button
						type="button"
						className="table-link-button"
						onClick={() => navigate(getLocalizedPath(`/faces/${info.getValue()}`))}
					>
						{info.getValue() as number}
					</button>
				),
			},
			{
				accessorKey: 'index',
				header: t('pages.faceDetail.index'),
				enableSorting: true,
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'title',
				header: t('pages.faceDetail.title'),
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
				accessorKey: 'color',
				header: t('pages.faceDetail.color'),
				enableSorting: false,
				cell: (info) => {
					const color = info.getValue() as string | undefined;
					if (!color) return '-';
					return (
						<span className="color-badge" style={{ backgroundColor: color }}>
							{color}
						</span>
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
					const faceId = info.row.original.id;
					return (
						<div className="table-actions">
							<Button
								variant="outline"
								onClick={() => navigate(getLocalizedPath(`/faces/${faceId}/edit`))}
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

	// React Table instance
	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data: faces,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		state: {
			sorting,
			columnFilters,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		manualPagination: false, // Client-side pagination for demo
		manualSorting: false, // Client-side sorting for demo
		manualFiltering: false, // Client-side filtering for demo
		pageCount: data ? Math.ceil(data.total / (data.pageSize || 10)) : undefined,
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

			<div className="faces-table-pagination">
				<div className="pagination-info">
					{t('common.showing')}{' '}
					{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{' '}
					{t('common.to')}{' '}
					{Math.min(
						(table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
						data?.total || 0
					)}{' '}
					{t('common.of')} {data?.total || 0} {t('pages.faces.faces')}
				</div>
				<div className="pagination-controls">
					<Button
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
						variant="outline"
					>
						{t('common.first')}
					</Button>
					<Button
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						variant="outline"
					>
						{t('common.previous')}
					</Button>
					<span className="pagination-page-info">
						{t('common.page')} {table.getState().pagination.pageIndex + 1} {t('common.of')}{' '}
						{table.getPageCount()}
					</span>
					<Button
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						variant="outline"
					>
						{t('common.next')}
					</Button>
					<Button
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
						variant="outline"
					>
						{t('common.last')}
					</Button>
				</div>
			</div>
		</div>
	);
}
