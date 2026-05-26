import type { ContentMediaItem } from '@/types/contentMedia';
import type { ApiSortDir } from '../../../utils/adminListQuery';

export interface AlbumFaceRef {
	faceId: number;
	title: string;
}

export interface AlbumListItem {
	id: number;
	title: string;
	description?: string | null;
	albumType: number;
	mediaType: number;
	creatorId: string;
	creatorName: string;
	faces?: AlbumFaceRef[];
	approvalStatus?: string;
	aiReviewStatus?: string;
	creatorStatusLabel?: string;
	mediaCount?: number;
	createdAt?: string;
	updatedAt?: string | null;
}

export interface AlbumDetail extends AlbumListItem {
	faces?: { faceId: number; title: string }[];
	mediaItems?: ContentMediaItem[];
	aiReviewUserMessage?: string | null;
	humanDecisionReason?: string | null;
	submittedAtUtc?: string | null;
	likesCount?: number;
	commentsCount?: number;
}

export interface OperatorAlbumDeletePayload {
	faceId: number;
	reason: string;
	userMessage: string;
}

export interface UseAlbumsParams {
	faceId?: number;
	creatorId?: string;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
	approvalStatus?: string;
	albumType?: string;
	mediaType?: string;
}

export interface UseAlbumsListResponse {
	items: AlbumListItem[];
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}
