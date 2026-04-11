import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	type ColumnDef,
	type SortingState,
	flexRender,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePages, type Page, deletePage } from '../hooks/api/usePagesApi';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from './radix/Table';
import { Button } from './radix/Button';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import { toast } from 'react-toastify';
import './PagesTable.scss';

interface PagesTableProps {
	faceId: number;
}

export function PagesTable({ faceId }: PagesTableProps) {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const queryClient = useQueryClient();
	const [sorting, setSorting] = useState<SortingState>([]);

	// React Query hook
	const { data: pages = [], isLoading, error, refetch } = usePages({ faceId });

	// Delete mutation
	const deletePageMutation = useMutation({
		mutationFn: deletePage,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['pages', { faceId }] });
			queryClient.invalidateQueries({ queryKey: ['face', faceId] });
			toast.success(t('pages.pagesTable.deleteSuccess'));
		},
		onError: (error: Error) => {
			toast.error(error.message || t('pages.pagesTable.deleteError'));
		},
	});

	const handleDelete = useCallback(
		(id: number) => {
			if (window.confirm(t('pages.pagesTable.confirmDelete'))) {
				deletePageMutation.mutate(id);
			}
		},
		[t, deletePageMutation]
	);

	// Define columns
	const columns = useMemo<ColumnDef<Page>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				enableSorting: true,
				cell: (info) => (
					<button
						type="button"
						className="table-link-button"
						onClick={() => navigate(getLocalizedPath(`/pages/${info.getValue()}`))}
					>
						{info.getValue() as number}
					</button>
				),
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
				cell: (info) => info.getValue(),
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
					return desc ? (desc.length > 50 ? `${desc.substring(0, 50)}...` : desc) : '-';
				},
			},
			{
				id: 'actions',
				header: t('common.actions'),
				enableSorting: false,
				cell: (info) => {
					const pageId = info.row.original.id;
					return (
						<div className="table-actions">
							<Button
								variant="outline"
								onClick={() => navigate(getLocalizedPath(`/pages/${pageId}/edit`))}
							>
								{t('common.edit')}
							</Button>
							<Button
								variant="danger"
								onClick={() => handleDelete(pageId)}
								disabled={deletePageMutation.isPending}
							>
								{t('common.delete')}
							</Button>
						</div>
					);
				},
			},
		],
		[t, navigate, getLocalizedPath, deletePageMutation.isPending, handleDelete]
	);

	// Get pages data
	const pagesData = pages || [];

	// React Table instance
	const table = useReactTable({
		data: pagesData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		state: {
			sorting,
		},
		onSortingChange: setSorting,
		manualPagination: false,
		manualSorting: false,
		manualFiltering: false,
	});

	if (isLoading) {
		return (
			<div className="pages-table-loading">
				<p>{t('pages.pagesTable.loading')}</p>
			</div>
		);
	}

	// Don't show error for empty results - just show empty table
	// Only show error if it's a real error (not just 404 for empty results)
	if (error && !isLoading) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		// If it's a 404 and we have no data, treat it as empty result
		if (errorMessage.includes('Not Found') || errorMessage.includes('404')) {
			// Show empty table instead of error
		} else {
			return (
				<div className="pages-table-error">
					<p>
						{t('pages.pagesTable.error')}: {errorMessage}
					</p>
					<Button onClick={() => refetch()}>{t('common.retry')}</Button>
				</div>
			);
		}
	}

	const handleCreateClick = () => {
		navigate(getLocalizedPath(`/faces/${faceId}/pages/create`));
	};

	return (
		<div className="pages-table-container">
			<div className="pages-table-header">
				<h3>{t('pages.pagesTable.title')}</h3>
				<Button onClick={handleCreateClick}>{t('pages.pagesTable.create')}</Button>
			</div>

			<div className="pages-table-wrapper">
				<Table variant="surface" size="2" className="pages-table">
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
									{t('pages.pagesTable.noPages')}
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
		</div>
	);
}
