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
