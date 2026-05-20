import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../api/core/OpenAPI';
import { request as __request } from '../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../utils/adminTableUtils';
import { parsePaginatedEnvelope, type ApiSortDir } from '../../utils/adminListQuery';

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

const fetchLounges = async (params: UseFaceVideoLoungesParams) => {
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
		url: `/api/faces/${params.faceId}/video-lounges`,
		query,
	});
	return parsePaginatedEnvelope<FaceVideoLoungeListItem>(response, page, pageSize);
};

const fetchLounge = async (faceId: number, loungeId: number): Promise<FaceVideoLoungeDetail> => {
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/faces/${faceId}/video-lounges/${loungeId}`,
	});
	return response as FaceVideoLoungeDetail;
};

/** Operator-visible live roster (includes AdminStealth) when caller has CanManageAllFaces. */
const fetchLive = async (
	faceId: number,
	loungeId: number
): Promise<FaceVideoLoungeLiveSnapshot> => {
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/faces/${faceId}/video-lounges/${loungeId}/live`,
	});
	return response as FaceVideoLoungeLiveSnapshot;
};

/** Operator REST paths (VL-AD-02: must not use member face-scoped live/join). */
export function operatorVideoLoungeStealthJoinPath(loungeId: number): string {
	return `/api/operator-content/video-lounges/${loungeId}/live/stealth-join`;
}

export function operatorVideoLoungeKickPath(loungeId: number, userId: string): string {
	return `/api/operator-content/video-lounges/${loungeId}/live/kick/${encodeURIComponent(userId)}`;
}

export function operatorVideoLoungeKickAllPath(loungeId: number): string {
	return `/api/operator-content/video-lounges/${loungeId}/live/kick-all`;
}

export const faceVideoLoungesKeys = {
	all: ['faceVideoLounges'] as const,
	list: (params: UseFaceVideoLoungesParams) =>
		[...faceVideoLoungesKeys.all, 'list', params] as const,
	detail: (faceId: number, loungeId: number) =>
		[...faceVideoLoungesKeys.all, 'detail', faceId, loungeId] as const,
	live: (faceId: number, loungeId: number) =>
		[...faceVideoLoungesKeys.all, 'live', faceId, loungeId] as const,
};

export function useFaceVideoLounges(params: UseFaceVideoLoungesParams) {
	return useQuery({
		queryKey: faceVideoLoungesKeys.list(params),
		queryFn: () => fetchLounges(params),
		enabled: params.faceId > 0,
		placeholderData: keepPreviousData,
	});
}

export function useFaceVideoLounge(faceId: number, loungeId: number) {
	return useQuery({
		queryKey: faceVideoLoungesKeys.detail(faceId, loungeId),
		queryFn: () => fetchLounge(faceId, loungeId),
		enabled: faceId > 0 && loungeId > 0,
		placeholderData: keepPreviousData,
	});
}

export function useFaceVideoLoungeLive(faceId: number, loungeId: number, enabled: boolean) {
	return useQuery({
		queryKey: faceVideoLoungesKeys.live(faceId, loungeId),
		queryFn: () => fetchLive(faceId, loungeId),
		enabled: enabled && faceId > 0 && loungeId > 0,
		refetchInterval: enabled ? 15_000 : false,
		placeholderData: keepPreviousData,
	});
}

/** Stealth observer join — operator API only; participant hidden from portal roster. */
export function useOperatorVideoLoungeStealthJoin() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ loungeId }: { loungeId: number; faceId: number }) => {
			return __request(OpenAPI, {
				method: 'POST',
				url: operatorVideoLoungeStealthJoinPath(loungeId),
			});
		},
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({
				queryKey: faceVideoLoungesKeys.live(vars.faceId, vars.loungeId),
			});
		},
	});
}

/** Force one live participant to leave (SFU + DB row + SignalR kick event). */
export function useOperatorVideoLoungeKick() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			loungeId,
			userId,
		}: {
			loungeId: number;
			faceId: number;
			userId: string;
		}) => {
			return __request(OpenAPI, {
				method: 'POST',
				url: operatorVideoLoungeKickPath(loungeId, userId),
			});
		},
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({
				queryKey: faceVideoLoungesKeys.live(vars.faceId, vars.loungeId),
			});
		},
	});
}

/** Disconnect all non-stealth participants; optional endSession closes the live session. */
export function useOperatorVideoLoungeKickAll() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			loungeId,
			endSession,
		}: {
			loungeId: number;
			faceId: number;
			endSession?: boolean;
		}) => {
			return __request(OpenAPI, {
				method: 'POST',
				url: operatorVideoLoungeKickAllPath(loungeId),
				query: endSession ? { endSession: true } : undefined,
			});
		},
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({ queryKey: faceVideoLoungesKeys.all });
			queryClient.invalidateQueries({
				queryKey: faceVideoLoungesKeys.detail(vars.faceId, vars.loungeId),
			});
			queryClient.invalidateQueries({
				queryKey: faceVideoLoungesKeys.live(vars.faceId, vars.loungeId),
			});
		},
	});
}
