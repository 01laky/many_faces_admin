import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHeaderCell,
	TableCell,
} from '@/components/radix/Table';

export interface ModerationMetricsBreakdownTableProps<T> {
	rows: T[];
	columns: ColumnDef<T, unknown>[];
	getRowId: (row: T) => string;
	className?: string;
}

/**
 * Small read-only two-column metrics breakdown (flags, pending-by-face).
 * TanStack Table is used for consistency with other admin grids; no sorting or pagination.
 */
export function ModerationMetricsBreakdownTable<T>({
	rows,
	columns,
	getRowId,
	className = 'content-moderation-page__breakdown-table',
}: ModerationMetricsBreakdownTableProps<T>) {
	const columnDefs = useMemo(() => columns, [columns]);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table; local render only
	const table = useReactTable({
		data: rows,
		columns: columnDefs,
		getCoreRowModel: getCoreRowModel(),
		getRowId,
	});

	return (
		<div className={`table-responsive ${className}`}>
			<Table variant="surface" size="1">
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
					{table.getRowModel().rows.map((row) => (
						<TableRow key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
