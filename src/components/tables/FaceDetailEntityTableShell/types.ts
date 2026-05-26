import type { ReactNode } from 'react';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';

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
