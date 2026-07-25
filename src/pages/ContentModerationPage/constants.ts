import type { SortingState } from '@tanstack/react-table';
import type {
	AiReviewRiskLevel,
	ContentApprovalStatus,
	ModeratedContentType,
} from '@/utils/contentModeration';

export const APPROVAL_FILTERS: Array<ContentApprovalStatus | ''> = [
	'PendingApproval',
	'Approved',
	'Rejected',
	'Removed',
	'',
];

export const CONTENT_TYPES: Array<ModeratedContentType | ''> = ['Album', 'Blog', 'Reel', ''];

export const RISK_FILTERS: Array<AiReviewRiskLevel | ''> = ['High', 'Medium', 'Low', 'Unknown', ''];

/** Initial sort for the moderation queue: most recently submitted first. Colocated per §2.15 (table metadata out of TSX). */
export const MODERATION_QUEUE_DEFAULT_SORT: SortingState = [{ id: 'submittedAtUtc', desc: true }];
