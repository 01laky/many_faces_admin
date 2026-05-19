/**
 * Shared presentation helpers for the admin moderation console (filters, labels, JWT role sniffing, bulk payloads).
 * These functions are intentionally pure so they are easy to unit test without mounting React.
 */
export type ContentApprovalStatus = 'PendingApproval' | 'Approved' | 'Rejected' | 'Removed';

export type AiReviewStatus =
	| 'NotQueued'
	| 'Queued'
	| 'InProgress'
	| 'RecommendedApprove'
	| 'RecommendedReject'
	| 'NeedsHumanReview'
	| 'Failed';

export type ModeratedContentType = 'Album' | 'Blog' | 'Reel';
export type AiReviewRiskLevel = 'Unknown' | 'Low' | 'Medium' | 'High';
export type BulkModerationAction = 'Approve' | 'Reject' | 'Remove' | 'RequeueAiReview';

/** Filter dropdown values aligned with backend enum strings for `GET /api/contentmoderation`. */
export const AI_REVIEW_STATUSES: Array<AiReviewStatus | ''> = [
	'Queued',
	'InProgress',
	'RecommendedApprove',
	'RecommendedReject',
	'NeedsHumanReview',
	'Failed',
	'NotQueued',
	'',
];

/** Client-side SUPER_ADMIN detection for gating the moderation route (mirrors backend checks). */
export function isSuperAdminFromToken(token: string | null | undefined) {
	if (!token) return false;
	try {
		const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
		const role =
			payload.role ??
			payload.roles ??
			payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
		if (Array.isArray(role)) {
			return role.includes('SUPER_ADMIN');
		}
		return role === 'SUPER_ADMIN';
	} catch {
		return false;
	}
}

/** Compact label for queue rows combining approval state with AI recommendation when still pending. */
export function getModerationQueueLabel(
	approvalStatus: ContentApprovalStatus,
	aiReviewStatus: AiReviewStatus
) {
	if (approvalStatus === 'PendingApproval' && aiReviewStatus === 'RecommendedApprove') {
		return 'AI recommended approval';
	}
	if (approvalStatus === 'PendingApproval' && aiReviewStatus === 'RecommendedReject') {
		return 'AI recommended rejection';
	}
	if (approvalStatus === 'PendingApproval' && aiReviewStatus === 'NeedsHumanReview') {
		return 'Needs human review';
	}
	return approvalStatus.replace(/([a-z])([A-Z])/g, '$1 $2');
}

/** Parses stored JSON flag arrays from the API; ignores non-string entries for forward compatibility. */
export function parseModerationFlags(flagsJson: string | null | undefined) {
	if (!flagsJson) return [];
	try {
		const parsed = JSON.parse(flagsJson);
		return Array.isArray(parsed)
			? parsed.filter((flag): flag is string => typeof flag === 'string')
			: [];
	} catch {
		return [];
	}
}

/** Formats ISO timestamps for moderation audit lists; tolerates null/invalid gracefully. */
export function formatOptionalDate(value: string | null | undefined) {
	if (!value) return 'Not set';
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
}

/** Stable row id for moderation queue selection maps and bulk payloads (`Album:42`). */
export function buildModerationRowKey(item: { contentType: string; contentId: number }): string {
	return `${item.contentType}:${item.contentId}`;
}

/**
 * Parses a moderation row key produced by {@link buildModerationRowKey}.
 * Returns null when the key is malformed (e.g. missing colon or non-numeric id).
 */
export function parseModerationRowKey(
	key: string
): { contentType: ModeratedContentType; contentId: number } | null {
	const colonIndex = key.indexOf(':');
	if (colonIndex <= 0) return null;
	const contentType = key.slice(0, colonIndex);
	const contentId = Number(key.slice(colonIndex + 1));
	if (!Number.isFinite(contentId)) return null;
	return {
		contentType: contentType as ModeratedContentType,
		contentId: Math.trunc(contentId),
	};
}

/** True when the bulk action button should stay disabled (nothing selected or mutation in flight). */
export function canRunBulkModeration(selectedCount: number, bulkActionPending: boolean): boolean {
	return selectedCount > 0 && !bulkActionPending;
}

/** Converts `ContentType:contentId` row keys into the bulk moderation POST body expected by the API. */
export function buildBulkModerationPayload(
	action: BulkModerationAction,
	selectedKeys: string[],
	reason: string,
	userMessage?: string
) {
	return {
		action,
		items: selectedKeys
			.map((key) => parseModerationRowKey(key))
			.filter((item): item is NonNullable<typeof item> => item != null),
		reason: reason.trim(),
		userMessage: userMessage?.trim() || undefined,
	};
}

/** Highlights the oldest-pending metric card once the queue is older than one day. */
export function shouldWarnAboutOldestPending(oldestPendingAgeHours?: number | null) {
	return typeof oldestPendingAgeHours === 'number' && oldestPendingAgeHours >= 24;
}

/**
 * Drives the yellow operational banner on the moderation dashboard.
 * Combines queue-age heuristics, any failed AI jobs, and structured alert severities from the metrics endpoint.
 */
export function dashboardHasOperationalWarnings(input: {
	oldestPendingAgeHours?: number | null;
	aiFailedJobs: number;
	alerts?: Array<{ severity: string }>;
}): boolean {
	if (shouldWarnAboutOldestPending(input.oldestPendingAgeHours)) return true;
	if (input.aiFailedJobs > 0) return true;
	return (input.alerts ?? []).some((a) => {
		const s = (a.severity || '').toLowerCase();
		return s === 'warning' || s === 'critical';
	});
}
