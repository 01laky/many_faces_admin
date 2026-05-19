import { keepPreviousData, useQuery } from '@tanstack/react-query';
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
	createdAt?: string;
}

export interface FaceChatRoomDetail extends FaceChatRoomListItem {
	description?: string | null;
	creatorUserId?: string | null;
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

export const faceChatRoomsKeys = {
	all: ['faceChatRooms'] as const,
	list: (params: UseFaceChatRoomsParams) => [...faceChatRoomsKeys.all, 'list', params] as const,
	detail: (faceId: number, roomId: number) =>
		[...faceChatRoomsKeys.all, 'detail', faceId, roomId] as const,
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
