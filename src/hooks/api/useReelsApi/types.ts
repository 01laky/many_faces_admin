import type { ApiSortDir } from '../../../utils/adminListQuery';

export interface ReelFaceRef {
	faceId: number;
	title: string;
}

export interface ReelListItem {
	id: number;
	title: string;
	description?: string | null;
	videoUrl?: string;
	creatorId: string;
	creatorName: string;
	faces?: ReelFaceRef[];
	likesCount?: number;
	commentsCount?: number;
	approvalStatus?: string;
	aiReviewStatus?: string;
	creatorStatusLabel?: string;
	createdAt?: string;
	updatedAt?: string | null;
}

export interface ReelDetail extends ReelListItem {
	aiReviewUserMessage?: string | null;
	humanDecisionReason?: string | null;
	submittedAtUtc?: string | null;
	aiReviewDecision?: string | null;
	aiReviewRiskLevel?: string | null;
	aiReviewFlagsJson?: string | null;
	aiReviewReason?: string | null;
	aiReviewModelVersion?: string | null;
	aiReviewTraceId?: string | null;
	isLikedByMe?: boolean;
}

export interface OperatorReelDeletePayload {
	faceId: number;
	reason: string;
	userMessage: string;
}

export interface UseReelsParams {
	faceId?: number;
	creatorId?: string;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
	approvalStatus?: string;
}
