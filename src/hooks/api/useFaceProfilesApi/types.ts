import type { ApiSortDir } from '../../../utils/adminListQuery';

export interface FaceProfileListItem {
	userId: string;
	displayName?: string | null;
	avatarUrl?: string | null;
	commentsCount?: number;
	likesCount?: number;
	reviewsCount?: number;
	isFaceBanned?: boolean;
}

export interface FaceProfileDetail {
	userId: string;
	userFaceProfileId?: number;
	displayName?: string | null;
	nickname?: string | null;
	age?: number | null;
	rod?: string | null;
	avatarUrl?: string | null;
	createdAt?: string;
	updatedAt?: string;
	faceAllowsRecensions?: boolean;
	faceVisibility?: string;
	faceRoleName?: string;
	isActive?: boolean;
	visited?: boolean;
	commentsCount?: number;
	likesCount?: number;
	reviewsCount?: number;
	isFaceBanned?: boolean;
	email?: string | null;
	likedByMe?: boolean;
}

export interface FaceProfileCommentItem {
	id: number;
	userId: string;
	body: string;
	createdAt: string;
	authorDisplayName?: string;
}

export interface FaceProfileReviewItem {
	id: number;
	authorUserId: string;
	title: string;
	text: string;
	stars: number;
	createdAt: string;
	authorDisplayName?: string;
}

export interface UseFaceProfilesParams {
	faceId: number;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
}

export interface UseFaceProfileSocialListParams {
	faceId: number;
	userId: string;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
}

export interface OperatorProfileSocialDeletePayload {
	faceId: number;
	reason: string;
	userMessage: string;
}
