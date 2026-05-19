import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	useReactTable,
	getCoreRowModel,
	type ColumnDef,
	type SortingState,
	type ColumnFiltersState,
	flexRender,
} from '@tanstack/react-table';
import { useUsers, type User } from '@/hooks/api/useUsersApi';
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
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { clampPageIndex, sortingStateToApi } from '@/utils/adminListQuery';
import { useAdminListSortValidationFeedback } from '@/hooks/useAdminListSortValidationFeedback';
import { AdminTablePagination } from '@/components/tables/AdminTablePagination';
import './UsersTable.scss';

export function UsersTable() {
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [search, setSearch] = useState('');
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: ADMIN_TABLE_PAGE_SIZE });

	const page = pagination.pageIndex + 1;
	const pageSize = pagination.pageSize;

	const apiSort = sortingStateToApi(sorting);

	const { data, isLoading, error, isError, refetch } = useUsers({
		page,
		pageSize,
		search: search || undefined,
		...apiSort,
	});

	useEffect(() => {
		if (!data?.totalPages) return;
		const next = clampPageIndex(pagination.pageIndex, data.totalPages);
		if (next !== pagination.pageIndex) {
			setPagination((p) => ({ ...p, pageIndex: next }));
		}
	}, [data?.totalPages, pagination.pageIndex]);

	useAdminListSortValidationFeedback(error, isError, setSorting);

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
		],
		[navigate, getLocalizedPath]
	);

	// Get users data - handle empty state gracefully
	const users = data?.users || [];

	/*
	 * Same TanStack Table + React Compiler interaction as other admin tables: `useReactTable` is flagged
	 * as incompatible with automatic memoization because it returns unstable function identities. Usage
	 * here is local-only (table markup), which matches TanStack's recommended integration pattern.
	 */
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table; rationale in block comment above
	const table = useReactTable({
		data: users,
		columns,
		getCoreRowModel: getCoreRowModel(),
		enableMultiSort: false,
		state: {
			sorting,
			columnFilters,
			pagination,
		},
		onSortingChange: (updater) => {
			setSorting(updater);
			setPagination((p) => ({ ...p, pageIndex: 0 }));
		},
		onColumnFiltersChange: setColumnFilters,
		onPaginationChange: setPagination,
		manualPagination: true,
		manualSorting: true,
		pageCount: data?.totalPages ?? 0,
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
						onChange={(e) => {
							setSearch(e.target.value);
							setPagination((prev) => ({ ...prev, pageIndex: 0 }));
						}}
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

			<AdminTablePagination
				table={table}
				totalItems={data?.total ?? 0}
				itemLabel="users"
				className="users-table-pagination"
			/>
		</div>
	);
}
