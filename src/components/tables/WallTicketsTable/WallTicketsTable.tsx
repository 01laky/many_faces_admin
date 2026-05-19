import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	type ColumnDef,
	type PaginationState,
} from '@tanstack/react-table';
import type { AdminWallTicketRow } from '@/hooks/api/useWallTicketsAdminApi';
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHeaderCell,
	TableCell,
} from '@/components/radix/Table';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { AdminTablePagination } from '@/components/tables/AdminTablePagination';
import {
	ADMIN_TABLE_PAGE_SIZE,
	isWallTicketRowSelected,
	wallTicketApiPageToTablePageIndex,
} from '@/utils/adminTableUtils';

export interface WallTicketStatusBadgeProps {
	status: string;
}

/** Status chip for wall ticket list rows (shared with page until fully colocated). */
export function WallTicketStatusBadge({ status }: WallTicketStatusBadgeProps) {
	const { t } = useTranslation('common');
	const s = status.toLowerCase();
	const cls =
		s === 'approved'
			? 'face-wall-tickets-page__badge--approved'
			: s === 'denied'
				? 'face-wall-tickets-page__badge--denied'
				: 'face-wall-tickets-page__badge--active';
	const labelKey =
		s === 'approved'
			? 'pages.faceWallTickets.statusApproved'
			: s === 'denied'
				? 'pages.faceWallTickets.statusDenied'
				: 'pages.faceWallTickets.statusActive';
	return <span className={`face-wall-tickets-page__badge ${cls}`}>{t(labelKey)}</span>;
}

export interface WallTicketsTableProps {
	items: AdminWallTicketRow[];
	selectedId: number | null | undefined;
	onSelectRow: (row: AdminWallTicketRow) => void;
	/** API list query uses 1-based page numbers. */
	page: number;
	totalCount: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	disabled?: boolean;
}

/**
 * Face-scoped wall ticket list with server pagination and row selection for the detail pane.
 * Parent owns Query data, URL `?ticketId=`, and mutations.
 */
export function WallTicketsTable({
	items,
	selectedId,
	onSelectRow,
	page,
	totalCount,
	totalPages,
	onPageChange,
	disabled = false,
}: WallTicketsTableProps) {
	const { t } = useTranslation('common');
	const getLocalizedPath = useLocalizedLink();

	const pagination = useMemo<PaginationState>(
		() => ({
			pageIndex: wallTicketApiPageToTablePageIndex(page),
			pageSize: ADMIN_TABLE_PAGE_SIZE,
		}),
		[page]
	);

	const columns = useMemo<ColumnDef<AdminWallTicketRow>[]>(
		() => [
			{
				accessorKey: 'id',
				header: () => t('pages.faceWallTickets.colId'),
			},
			{
				accessorKey: 'title',
				header: () => t('pages.faceWallTickets.colTitle'),
			},
			{
				id: 'status',
				header: () => t('pages.faceWallTickets.colStatus'),
				cell: ({ row }) => <WallTicketStatusBadge status={row.original.status} />,
			},
			{
				id: 'creator',
				header: () => t('pages.faceWallTickets.colCreator'),
				cell: ({ row }) => {
					const ticket = row.original;
					return ticket.creatorId ? (
						<Link
							to={getLocalizedPath(`/users/${ticket.creatorId}`)}
							onClick={(e) => e.stopPropagation()}
						>
							{ticket.creatorName || ticket.creatorId}
						</Link>
					) : (
						ticket.creatorName
					);
				},
			},
			{
				id: 'counts',
				header: () => t('pages.faceWallTickets.colCounts'),
				cell: ({ row }) => `${row.original.likesCount} / ${row.original.commentsCount}`,
			},
		],
		[getLocalizedPath, t]
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table; local render only
	const table = useReactTable({
		data: items,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => String(row.id),
		manualPagination: true,
		pageCount: totalPages,
		state: { pagination },
		onPaginationChange: (updater) => {
			const next = typeof updater === 'function' ? updater(pagination) : updater;
			const apiPage = next.pageIndex + 1;
			if (apiPage !== page) onPageChange(apiPage);
		},
	});

	const handleRowActivate = (row: AdminWallTicketRow) => {
		if (!disabled) onSelectRow(row);
	};

	return (
		<>
			<div className="table-responsive">
				<Table variant="surface" size="2" className="face-wall-tickets-table">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHeaderCell key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHeaderCell>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.map((row) => {
							const ticket = row.original;
							const selected = isWallTicketRowSelected(selectedId, ticket.id);
							return (
								<TableRow
									key={row.id}
									className={selected ? 'face-wall-tickets-page__row--selected' : undefined}
									role="button"
									tabIndex={0}
									onClick={() => handleRowActivate(ticket)}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											handleRowActivate(ticket);
										}
									}}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>

			<AdminTablePagination
				table={table}
				totalItems={totalCount}
				itemLabel={t('pages.faceWallTickets.ticketsLabel')}
				className="face-wall-tickets-page__pager admin-table-pagination"
			/>
		</>
	);
}
