import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../../utils/adminTableUtils';
import { parsePaginatedEnvelope } from '../../../utils/adminListQuery';
import type {
	FaceChatRoomDetail,
	FaceChatRoomJoinRequestItem,
	FaceChatRoomListItem,
	FaceChatRoomMemberItem,
	FaceChatRoomMessageItem,
	UseFaceChatRoomMembersParams,
	UseFaceChatRoomMessagesParams,
	UseFaceChatRoomsParams,
} from './types';

export const fetchRooms = async (params: UseFaceChatRoomsParams) => {
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

export const fetchRoom = async (faceId: number, roomId: number): Promise<FaceChatRoomDetail> => {
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/faces/${faceId}/chat-rooms/${roomId}`,
	});
	return response as FaceChatRoomDetail;
};

export const fetchMessagesPage = async (params: UseFaceChatRoomMessagesParams) => {
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

export const fetchMembers = async (params: UseFaceChatRoomMembersParams) => {
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

export const fetchJoinRequests = async (
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
