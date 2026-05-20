import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../api/core/OpenAPI';
import { request as __request } from '../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../utils/adminTableUtils';
import { parsePaginatedEnvelope, type ApiSortDir } from '../../utils/adminListQuery';

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

const fetchRooms = async (params: UseFaceChatRoomsParams) => {
	const page = params.page || 1;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	const query: Record<string, string | number | boolean> = { page, pageSize };
	if (params.search?.trim()) query.search = params.search.trim();
	if (params.sortBy) {
		query.sortBy = params.sortBy;
		query.sortDir = params.sortDir ?? 'asc';
	}
	if (params.isPublic != null) query.isPublic = params.isPublic;
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/faces/${params.faceId}/chat-rooms`,
		query,
	});
	return parsePaginatedEnvelope<FaceChatRoomListItem>(response, page, pageSize);
};

const fetchRoom = async (faceId: number, roomId: number): Promise<FaceChatRoomDetail> => {
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/faces/${faceId}/chat-rooms/${roomId}`,
	});
	return response as FaceChatRoomDetail;
};

const fetchMessagesPage = async (params: UseFaceChatRoomMessagesParams) => {
	const page = params.page;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	const query: Record<string, string | number> = { page, pageSize };
	if (params.search?.trim()) query.search = params.search.trim();
	if (params.sortBy) {
		query.sortBy = params.sortBy;
		query.sortDir = params.sortDir ?? 'asc';
	}
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/faces/${params.faceId}/chat-rooms/${params.roomId}/messages`,
		query,
	});
	return parsePaginatedEnvelope<FaceChatRoomMessageItem>(response, page, pageSize);
};

const fetchMembers = async (params: UseFaceChatRoomMembersParams) => {
	const page = params.page;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	const query: Record<string, string | number> = { page, pageSize };
	if (params.search?.trim()) query.search = params.search.trim();
	if (params.sortBy) {
		query.sortBy = params.sortBy;
		query.sortDir = params.sortDir ?? 'asc';
	}
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/faces/${params.faceId}/chat-rooms/${params.roomId}/members`,
		query,
	});
	return parsePaginatedEnvelope<FaceChatRoomMemberItem>(response, page, pageSize);
};

const fetchJoinRequests = async (
	faceId: number,
	roomId: number,
	page: number,
	pageSize: number
) => {
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/faces/${faceId}/chat-rooms/${roomId}/join-requests`,
		query: { page, pageSize },
	});
	return parsePaginatedEnvelope<FaceChatRoomJoinRequestItem>(response, page, pageSize);
};

export const faceChatRoomsKeys = {
	all: ['faceChatRooms'] as const,
	list: (params: UseFaceChatRoomsParams) => [...faceChatRoomsKeys.all, 'list', params] as const,
	detail: (faceId: number, roomId: number) =>
		[...faceChatRoomsKeys.all, 'detail', faceId, roomId] as const,
	messages: (params: UseFaceChatRoomMessagesParams) =>
		[...faceChatRoomsKeys.all, 'messages', params] as const,
	members: (params: UseFaceChatRoomMembersParams) =>
		[...faceChatRoomsKeys.all, 'members', params] as const,
	joinRequests: (faceId: number, roomId: number, page: number) =>
		[...faceChatRoomsKeys.all, 'joinRequests', faceId, roomId, page] as const,
};

export function useFaceChatRooms(params: UseFaceChatRoomsParams) {
	return useQuery({
		queryKey: faceChatRoomsKeys.list(params),
		queryFn: () => fetchRooms(params),
		enabled: params.faceId > 0,
		placeholderData: keepPreviousData,
	});
}

export function useFaceChatRoom(faceId: number, roomId: number) {
	return useQuery({
		queryKey: faceChatRoomsKeys.detail(faceId, roomId),
		queryFn: () => fetchRoom(faceId, roomId),
		enabled: faceId > 0 && roomId > 0,
		placeholderData: keepPreviousData,
	});
}

export function useFaceChatRoomMessages(params: UseFaceChatRoomMessagesParams) {
	return useQuery({
		queryKey: faceChatRoomsKeys.messages(params),
		queryFn: () => fetchMessagesPage(params),
		enabled: params.faceId > 0 && params.roomId > 0,
		placeholderData: keepPreviousData,
	});
}

export function useFaceChatRoomMembers(params: UseFaceChatRoomMembersParams) {
	return useQuery({
		queryKey: faceChatRoomsKeys.members(params),
		queryFn: () => fetchMembers(params),
		enabled: params.faceId > 0 && params.roomId > 0,
		placeholderData: keepPreviousData,
	});
}

export function useFaceChatRoomJoinRequests(faceId: number, roomId: number, enabled: boolean) {
	return useQuery({
		queryKey: faceChatRoomsKeys.joinRequests(faceId, roomId, 1),
		queryFn: () => fetchJoinRequests(faceId, roomId, 1, ADMIN_TABLE_PAGE_SIZE),
		enabled: enabled && faceId > 0 && roomId > 0,
	});
}

export function useDeleteFaceChatRoom() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			roomId,
			payload,
		}: {
			roomId: number;
			payload: OperatorChatRoomDeletePayload;
		}) => {
			await __request(OpenAPI, {
				method: 'POST',
				url: `/api/operator-content/chat-rooms/${roomId}/delete`,
				body: payload,
			});
		},
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({ queryKey: faceChatRoomsKeys.all });
			queryClient.removeQueries({
				queryKey: faceChatRoomsKeys.detail(vars.payload.faceId, vars.roomId),
			});
		},
	});
}
