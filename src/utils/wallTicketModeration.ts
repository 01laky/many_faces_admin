/** Pure gating for wall-ticket moderation actions in admin UI (status from API string). */
export function wallTicketActionsForStatus(status: string) {
	const s = status.toLowerCase();
	return {
		canApprove: s === 'active',
		canDeny: s === 'active',
		canDeleteTicket: true,
		canAddComment: s === 'active',
		canDeleteComment: true,
	};
}

export type WallTicketStatusFilter = '' | 'active' | 'approved' | 'denied';

export function statusFilterToQuery(status: WallTicketStatusFilter): string | undefined {
	return status === '' ? undefined : status;
}

/** Parses `?ticketId=` from the location search string; invalid values return null. */
export function parseWallTicketIdFromSearch(raw: string | null): number | null {
	if (raw == null || raw === '') {
		return null;
	}
	const n = parseInt(raw, 10);
	return Number.isFinite(n) && n > 0 ? n : null;
}

/** React Router `setSearchParams` payload for opening a ticket in the detail pane. */
export function wallTicketDetailSearchParams(ticketId: number): Record<string, string> {
	return { ticketId: String(ticketId) };
}
