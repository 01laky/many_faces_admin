import type { StoryFaceRef } from '@/utils/storyDetailUi';
import type { StoryImageDto } from '@/utils/storyDetailMedia';
import type { ApiSortDir } from '../../../utils/adminListQuery';

export interface StoryListItem {
	id: number;
	title: string;
	creatorId?: string;
	creatorName?: string;
	imageCount?: number;
	isPublished?: boolean;
	state?: string;
	publishedAt?: string | null;
	expiresAt?: string | null;
	createdAt?: string;
}

export interface StoryViewerRow {
	viewerUserId: string;
	viewerName?: string;
	viewedAt: string;
}

export interface StoryDetail extends StoryListItem {
	scheduledPublishAt?: string | null;
	updatedAt?: string | null;
	images?: StoryImageDto[];
	faces?: StoryFaceRef[];
	likesCount?: number;
	commentsCount?: number;
	viewCount?: number;
	viewers?: StoryViewerRow[];
}

export interface UseStoriesParams {
	faceId?: number;
	creatorId?: string;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
	isPublished?: boolean;
}

export interface OperatorStoryDeletePayload {
	faceId: number;
	reason: string;
	userMessage: string;
}
