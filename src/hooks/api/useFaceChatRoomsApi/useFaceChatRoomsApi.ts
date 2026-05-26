import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import type {
	OperatorChatRoomDeletePayload,
	UseFaceChatRoomMembersParams,
	UseFaceChatRoomMessagesParams,
	UseFaceChatRoomsParams,
} from './types';
import {
	fetchRooms,
	fetchRoom,
	fetchMessagesPage,
	fetchMembers,
	fetchJoinRequests,
	faceChatRoomsKeys,
} from './constants';

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
