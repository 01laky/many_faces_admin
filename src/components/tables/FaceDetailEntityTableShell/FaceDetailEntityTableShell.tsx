import { useEffect, type ReactNode } from 'react';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
} from '@/components/radix/Table';
import { Button } from '@/components/radix/Button';
import { AdminTablePagination } from '@/components/tables/AdminTablePagination';
import { clampPageIndex } from '@/utils/adminListQuery';
import { useAdminListSortValidationFeedback } from '@/hooks/useAdminListSortValidationFeedback';
import { handleAdminTableRowKeyDown } from '@/utils/adminTableRowClick';
import './FaceDetailEntityTableShell.scss';

export interface FaceDetailListEnvelope<T> {
	items: T[];
	totalCount: number;
	totalPages: number;
}

export interface FaceDetailEntityTableShellProps<T> {
	sectionTitle: string;
	emptyMessage: string;
	loadingMessage: string;
	errorMessagePrefix: string;
	itemLabel: string;
	columns: ColumnDef<T>[];
	data: T[];
	totalCount: number;
	totalPages: number;
	isLoading: boolean;
	isError: boolean;
	error: unknown;
	refetch: () => void;
	sorting: SortingState;
	onSortingChange: (next: SortingState) => void;
	pagination: PaginationState;
	onPaginationChange: (next: PaginationState) => void;
	extraFilters?: ReactNode;
	/** Navigate to read-only detail (whole row is clickable). */
	onRowClick?: (row: T) => void;
	/** When set with onRowClick, only matching rows are clickable (e.g. admin-scope faces). */
	isRowClickable?: (row: T) => boolean;
	/** e.g. Create button in section header (Pages table). */
	headerActions?: ReactNode;
	/** Extra class on outer section (e.g. list pages without top margin). */
	sectionClassName?: string;
}

/** Shared Bootstrap-styled server-driven table for Face detail sections. */
export function FaceDetailEntityTableShell<T>({
	sectionTitle,
	emptyMessage,
	loadingMessage,
	errorMessagePrefix,
	itemLabel,
	columns,
	data,
	totalCount,
	totalPages,
	isLoading,
	isError,
	error,
	refetch,
	sorting,
	onSortingChange,
	pagination,
	onPaginationChange,
	extraFilters,
	onRowClick,
	isRowClickable,
	headerActions,
	sectionClassName,
}: FaceDetailEntityTableShellProps<T>) {
	const { t } = useTranslation('common');

	useEffect(() => {
		if (!totalPages) return;
		const next = clampPageIndex(pagination.pageIndex, totalPages);
		if (next !== pagination.pageIndex) {
			onPaginationChange({ ...pagination, pageIndex: next });
		}
	}, [totalPages, pagination, onPaginationChange]);

	useAdminListSortValidationFeedback(error, isError, onSortingChange);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		enableMultiSort: false,
		state: { sorting, pagination },
		onSortingChange: (updater) => {
			const next = typeof updater === 'function' ? updater(sorting) : updater;
			onSortingChange(next);
			onPaginationChange({ ...pagination, pageIndex: 0 });
		},
		onPaginationChange: (updater) => {
			const next = typeof updater === 'function' ? updater(pagination) : updater;
			onPaginationChange(next);
		},
		manualPagination: true,
		manualSorting: true,
		pageCount: totalPages,
	});

	const sectionClass = ['admin-data-table-section', sectionClassName].filter(Boolean).join(' ');

	if (isLoading) {
		return (
			<section className={`${sectionClass} admin-data-table-section--loading`}>
				<div className="admin-data-table-section__header">
					<h2>{sectionTitle}</h2>
				</div>
				<p className="mb-0">{loadingMessage}</p>
			</section>
		);
	}

	if (isError && error) {
		const msg = error instanceof Error ? error.message : String(error);
		if (!msg.includes('404')) {
			return (
				<section className={`${sectionClass} admin-data-table-section--error`}>
					<div className="admin-data-table-section__header">
						<h2>{sectionTitle}</h2>
					</div>
					<p className="mb-2">
						{errorMessagePrefix}: {msg}
					</p>
					<Button onClick={() => refetch()}>{t('common.retry')}</Button>
				</section>
			);
		}
	}

	return (
		<section className={sectionClass}>
			<div className="admin-data-table-section__header">
				<h2>{sectionTitle}</h2>
				{headerActions}
			</div>
			{extraFilters}
			<Card className="admin-data-table-card">
				<Card.Body className="p-0">
					<div className="admin-data-table-wrapper">
						<Table
							variant="ghost"
							size="2"
							className="admin-data-table table table-hover align-middle mb-0"
						>
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
												<span className="admin-data-table__header-content">
													{flexRender(header.column.columnDef.header, header.getContext())}
													{header.column.getIsSorted() ? (
														<span className="admin-data-table__sort-icon" aria-hidden>
															{header.column.getIsSorted() === 'desc' ? '↓' : '↑'}
														</span>
													) : null}
												</span>
											</TableHeaderCell>
										))}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={columns.length} className="admin-data-table__empty">
											{emptyMessage}
										</TableCell>
									</TableRow>
								) : (
									table.getRowModel().rows.map((row) => {
										const rowClickable =
											onRowClick && (isRowClickable ? isRowClickable(row.original) : true);
										const activateRow = rowClickable ? () => onRowClick(row.original) : undefined;
										return (
											<TableRow
												key={row.id}
												className={rowClickable ? 'admin-data-table__row--clickable' : undefined}
												onClick={activateRow}
												onKeyDown={
													activateRow
														? (event) => handleAdminTableRowKeyDown(event, activateRow)
														: undefined
												}
												tabIndex={rowClickable ? 0 : undefined}
												role={rowClickable ? 'button' : undefined}
											>
												{row.getVisibleCells().map((cell) => (
													<TableCell key={cell.id}>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												))}
											</TableRow>
										);
									})
								)}
							</TableBody>
						</Table>
					</div>
				</Card.Body>
				{totalCount > 0 ? (
					<div className="admin-data-table-card__footer">
						<AdminTablePagination table={table} totalItems={totalCount} itemLabel={itemLabel} />
					</div>
				) : null}
			</Card>
		</section>
	);
}
