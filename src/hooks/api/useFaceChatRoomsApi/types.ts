export interface FaceChatRoomListItem {
	id: number;
	title: string;
	isPublic: boolean;
	isSystemManaged?: boolean;
	memberCount?: number;
	messageCount?: number;
	createdAt?: string;
	updatedAt?: string | null;
	lastMessageAt?: string | null;
}

export interface FaceChatRoomDetail extends FaceChatRoomListItem {
	description?: string | null;
	creatorUserId?: string | null;
	pendingJoinRequestCount?: number;
}

export interface FaceChatRoomMessageItem {
	id: number;
	senderUserId: string;
	senderDisplayName?: string;
	content: string;
	sentAt: string;
}

export interface FaceChatRoomMemberItem {
	userId: string;
	displayName: string;
	joinedAt: string;
}

export interface FaceChatRoomJoinRequestItem {
	requestId: number;
	userId: string;
	displayName: string;
	createdAt: string;
	status: string;
}

export interface UseFaceChatRoomsParams {
	faceId: number;
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
	isPublic?: boolean;
}

export interface UseFaceChatRoomMessagesParams {
	faceId: number;
	roomId: number;
	page: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
}

export interface UseFaceChatRoomMembersParams {
	faceId: number;
	roomId: number;
	page: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDir;
}

export interface OperatorChatRoomDeletePayload {
	faceId: number;
	reason: string;
	userMessage: string;
}
