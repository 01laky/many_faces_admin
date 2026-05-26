import type { ApiSortDir } from '../../../utils/adminListQuery';

export interface BlogImageDto {
	id: number;
	imageUrl: string;
	sortOrder: number;
}

export interface BlogListItem {
	id: number;
	title: string;
	content?: string;
	creatorId: string;
	creatorName: string;
	faceId?: number;
	faceTitle?: string;
	imageCount?: number;
	images?: BlogImageDto[];
	likesCount?: number;
	commentsCount?: number;
	approvalStatus?: string;
	aiReviewStatus?: string;
	creatorStatusLabel?: string;
	createdAt?: string;
	updatedAt?: string | null;
}

export interface BlogDetail extends BlogListItem {
	contentPlainText?: string;
	aiReviewUserMessage?: string | null;
	humanDecisionReason?: string | null;
	submittedAtUtc?: string | null;
	removedAtUtc?: string | null;
	removalReason?: string | null;
	aiReviewDecision?: string | null;
	aiReviewRiskLevel?: string | null;
	aiReviewFlagsJson?: string | null;
	aiReviewReason?: string | null;
	aiReviewModelVersion?: string | null;
	aiReviewTraceId?: string | null;
	aiReviewConfidence?: number | null;
}

export interface UseBlogsParams {
	faceId?: number;
	creatorId?: string;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
	approvalStatus?: string;
}

export interface OperatorBlogDeletePayload {
	faceId: number;
	reason: string;
	userMessage: string;
}
