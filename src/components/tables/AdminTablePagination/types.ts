import type { Table } from '@tanstack/react-table';

export interface AdminTablePaginationProps<T> {
	table: Table<T>;
	/** Total row count (all pages). */
	totalItems: number;
	/** Noun shown after the count, e.g. "users" or "faces". */
	itemLabel: string;
	className?: string;
}
