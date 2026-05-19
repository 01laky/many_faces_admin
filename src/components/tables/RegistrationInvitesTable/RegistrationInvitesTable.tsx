import { useMemo } from 'react';
import { Badge, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	type ColumnDef,
	type PaginationState,
} from '@tanstack/react-table';
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHeaderCell,
	TableCell,
} from '@/components/radix/Table';
import {
	isPendingInviteStatus,
	type RegistrationInviteRow,
} from '@/hooks/api/useRegistrationInvitesAdminApi';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { AdminTablePagination } from '@/components/tables/AdminTablePagination';

export interface RegistrationInvitesTableProps {
	rows: RegistrationInviteRow[];
	totalCount: number;
	totalPages: number;
	pageIndex: number;
	onPageIndexChange: (pageIndex: number) => void;
	actionBusy: boolean;
	onResend: (email: string) => void;
	onRevoke: (id: string) => void;
}

/**
 * Registration invite list for operators (email-code signup workflow).
 * Mutations are invoked via parent callbacks; this table is presentation-only.
 */
export function RegistrationInvitesTable({
	rows,
	totalCount,
	totalPages,
	pageIndex,
	onPageIndexChange,
	actionBusy,
	onResend,
	onRevoke,
}: RegistrationInvitesTableProps) {
	const { t } = useTranslation('common');
	const pagination: PaginationState = {
		pageIndex,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	};

	const columns = useMemo<ColumnDef<RegistrationInviteRow>[]>(
		() => [
			{
				accessorKey: 'email',
				header: () => t('pages.registrationInvites.email'),
			},
			{
				id: 'status',
				header: () => t('pages.registrationInvites.status'),
				cell: ({ row }) => (
					<Badge bg={isPendingInviteStatus(row.original.status) ? 'warning' : 'secondary'}>
						{row.original.status}
					</Badge>
				),
			},
			{
				id: 'expires',
				header: () => t('pages.registrationInvites.expires'),
				cell: ({ row }) => new Date(row.original.expiresAtUtc).toLocaleString(),
			},
			{
				id: 'actions',
				header: () => '',
				enableSorting: false,
				cell: ({ row }) => {
					const invite = row.original;
					if (!isPendingInviteStatus(invite.status)) return null;
					return (
						<>
							<Button
								size="sm"
								variant="outline-secondary"
								className="me-2"
								disabled={actionBusy}
								onClick={() => onResend(invite.email)}
							>
								{t('pages.registrationInvites.resend')}
							</Button>
							<Button
								size="sm"
								variant="outline-danger"
								disabled={actionBusy}
								onClick={() => onRevoke(invite.id)}
							>
								{t('pages.registrationInvites.revoke')}
							</Button>
						</>
					);
				},
			},
		],
		[actionBusy, onResend, onRevoke, t]
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table; local render only
	const table = useReactTable({
		data: rows,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id,
		state: { pagination },
		onPaginationChange: (updater) => {
			const next = typeof updater === 'function' ? updater(pagination) : updater;
			onPageIndexChange(next.pageIndex);
		},
		manualPagination: true,
		pageCount: totalPages,
	});

	return (
		<div className="table-responsive registration-invites-table">
			<Table variant="surface" size="2">
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
					{table.getRowModel().rows.length === 0 ? (
						<TableRow>
							<TableCell colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
								—
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
			<AdminTablePagination
				table={table}
				totalItems={totalCount}
				itemLabel={t('pages.registrationInvites.title')}
				className="registration-invites-table__pagination"
			/>
		</div>
	);
}
