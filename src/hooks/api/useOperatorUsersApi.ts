import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FacesService } from '../../api/services/FacesService';
import {
	fetchOperatorUserDetail,
	postOperatorGlobalBan,
	deleteOperatorGlobalBan,
	postOperatorFaceBan,
	deleteOperatorFaceBan,
	patchOperatorFaceRole,
} from '../../api/operatorUsersApiClient';

export interface OperatorUserFaceRow {
	faceId: number;
	faceIndex: string;
	faceTitle: string;
	userRoleId: number;
	roleName: string;
	isActiveParticipant: boolean;
	isFaceBanned: boolean;
}

export interface OperatorUserDetail {
	id: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	createdAt?: string;
	globalRole: { userRoleId: number; name: string };
	badges: {
		isGloballyBanned: boolean;
		activeFaceBanCount: number;
		emailConfirmed: boolean;
		accessTokenVersion: number;
	};
	faces: OperatorUserFaceRow[];
}

export interface FaceRoleOption {
	id: number;
	name: string;
}

const operatorUserDetailKey = (id: string) => ['operator-user-detail', id] as const;

export function useOperatorUserDetail(userId: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: operatorUserDetailKey(userId),
		queryFn: async () => (await fetchOperatorUserDetail(userId)) as OperatorUserDetail,
		enabled: !!userId && (options?.enabled ?? true),
	});
}

export function useFaceRoles() {
	return useQuery({
		queryKey: ['face-roles'],
		queryFn: async () => (await FacesService.getApiFacesFaceRoles()) as FaceRoleOption[],
		staleTime: 10 * 60 * 1000,
	});
}

export function useOperatorUserMutations(userId: string) {
	const queryClient = useQueryClient();

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: operatorUserDetailKey(userId) });

	const globalBan = useMutation({
		mutationFn: (reason: string) => postOperatorGlobalBan(userId, reason),
		onSuccess: invalidate,
	});

	const globalUnban = useMutation({
		mutationFn: () => deleteOperatorGlobalBan(userId),
		onSuccess: invalidate,
	});

	const faceBan = useMutation({
		mutationFn: ({ faceId, reason }: { faceId: number; reason: string }) =>
			postOperatorFaceBan(userId, faceId, reason),
		onSuccess: invalidate,
	});

	const faceUnban = useMutation({
		mutationFn: (faceId: number) => deleteOperatorFaceBan(userId, faceId),
		onSuccess: invalidate,
	});

	const setFaceRole = useMutation({
		mutationFn: ({ faceId, userRoleId }: { faceId: number; userRoleId: number }) =>
			patchOperatorFaceRole(userId, faceId, userRoleId),
		onSuccess: invalidate,
	});

	return { globalBan, globalUnban, faceBan, faceUnban, setFaceRole };
}
