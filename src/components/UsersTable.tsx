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
import { useUsers, type User } from '../hooks/api/useUsersApi';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from './radix/Table';
import { Button } from './radix/Button';
import { Input } from './radix/Input';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import './UsersTable.scss';

export function UsersTable() {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [search, setSearch] = useState('');

	// React Query hook
	const { data, isLoading, error, refetch } = useUsers({
		page: 1,
		pageSize: 10,
		search: search || undefined,
	});

	// Define columns
	const columns = useMemo<ColumnDef<User>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				enableSorting: true,
				cell: (info) => (
					<button
						type="button"
						className="table-link-button"
						onClick={() => navigate(getLocalizedPath(`/users/${info.getValue()}`))}
					>
						{info.getValue() as string}
					</button>
				),
			},
			{
				accessorKey: 'email',
				header: 'Email',
				enableSorting: true,
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'firstName',
				header: 'First Name',
				enableSorting: true,
				cell: (info) => info.getValue() || '-',
			},
			{
				accessorKey: 'lastName',
				header: 'Last Name',
				enableSorting: true,
				cell: (info) => info.getValue() || '-',
			},
			{
				accessorKey: 'createdAt',
				header: 'Created At',
				enableSorting: true,
				cell: (info) => {
					const date = info.getValue() as string | undefined;
					if (!date) return '-';
					return new Date(date).toLocaleDateString();
				},
			},
			{
				id: 'actions',
				header: t('common.actions'),
				enableSorting: false,
				cell: (info) => {
					const userId = info.row.original.id;
					return (
						<div className="table-actions">
							<Button
								variant="outline"
								onClick={() => navigate(getLocalizedPath(`/users/${userId}/edit`))}
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

	// Get users data - handle empty state gracefully
	const users = data?.users || [];

	// React Table instance
	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data: users,
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
			<div className="users-table-loading">
				<p>Loading users...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="users-table-error">
				<p>Error loading users: {error instanceof Error ? error.message : 'Unknown error'}</p>
				<Button onClick={() => refetch()}>Retry</Button>
			</div>
		);
	}

	const handleCreateClick = () => {
		navigate(getLocalizedPath('/users/create'));
	};

	return (
		<div className="users-table-container">
			<div className="users-table-header">
				<h2>Users</h2>
				<div className="users-table-actions">
					<Input
						type="text"
						placeholder="Search users..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="users-table-search"
					/>
					<Button onClick={() => refetch()}>Refresh</Button>
					<Button onClick={handleCreateClick}>Create User</Button>
				</div>
			</div>

			<div className="users-table-wrapper">
				<Table variant="surface" size="2" className="users-table">
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
									No users found
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

			<div className="users-table-pagination">
				<div className="pagination-info">
					Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{' '}
					to{' '}
					{Math.min(
						(table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
						data?.total || 0
					)}{' '}
					of {data?.total || 0} users
				</div>
				<div className="pagination-controls">
					<Button
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
						variant="outline"
					>
						First
					</Button>
					<Button
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						variant="outline"
					>
						Previous
					</Button>
					<span className="pagination-page-info">
						Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
					</span>
					<Button
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						variant="outline"
					>
						Next
					</Button>
					<Button
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
						variant="outline"
					>
						Last
					</Button>
				</div>
			</div>
		</div>
	);
}
