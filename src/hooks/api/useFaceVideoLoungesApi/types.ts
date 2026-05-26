export interface FaceVideoLoungeListItem {
	id: number;
	title: string;
	isPublic: boolean;
	isSystemManaged?: boolean;
	memberCount?: number;
	hasLiveSession?: boolean;
	liveParticipantCount?: number;
	maxParticipants?: number;
	createdAt?: string;
	updatedAt?: string | null;
}

export interface FaceVideoLoungeDetail extends FaceVideoLoungeListItem {
	description?: string | null;
	creatorUserId?: string | null;
}

export interface VideoLoungeOperatorParticipant {
	userId: string;
	displayName: string;
	avatarUrl?: string | null;
	joinMode: string;
	audioEnabled: boolean;
	videoEnabled: boolean;
	isListedInPublicRoster: boolean;
}

export interface FaceVideoLoungeLiveSnapshot {
	hasLiveSession: boolean;
	liveParticipantCount: number;
	liveViewerCount?: number;
	liveSpeakerCount?: number;
	operatorLiveParticipants?: VideoLoungeOperatorParticipant[];
}

export interface UseFaceVideoLoungesParams {
	faceId: number;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
	isPublic?: boolean;
}
