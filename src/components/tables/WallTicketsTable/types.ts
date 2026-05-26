import type { AdminWallTicketRow } from '@/hooks/api/useWallTicketsAdminApi';

export interface WallTicketStatusBadgeProps {
	status: string;
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
