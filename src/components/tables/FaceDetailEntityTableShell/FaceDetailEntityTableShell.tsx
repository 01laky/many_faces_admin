import { useEffect, type ReactNode } from 'react';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
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
}

/** Shared server-driven table chrome for Face detail entity sections (§2.8). */
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

	if (isLoading) {
		return (
			<section className="face-detail-entity-section">
				<h2>{sectionTitle}</h2>
				<p>{loadingMessage}</p>
			</section>
		);
	}

	if (isError && error) {
		const msg = error instanceof Error ? error.message : String(error);
		if (!msg.includes('404')) {
			return (
				<section className="face-detail-entity-section">
					<h2>{sectionTitle}</h2>
					<p>
						{errorMessagePrefix}: {msg}
					</p>
					<Button onClick={() => refetch()}>{t('common.retry')}</Button>
				</section>
			);
		}
	}

	return (
		<section className="face-detail-entity-section">
			<h2>{sectionTitle}</h2>
			{extraFilters}
			<div className="face-detail-entity-table-wrapper">
				<Table variant="surface" size="2">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHeaderCell
										key={header.id}
										onClick={header.column.getToggleSortingHandler()}
										style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
									>
										{flexRender(header.column.columnDef.header, header.getContext())}
									</TableHeaderCell>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={columns.length} style={{ textAlign: 'center' }}>
									{emptyMessage}
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
			<AdminTablePagination table={table} totalItems={totalCount} itemLabel={itemLabel} />
		</section>
	);
}
