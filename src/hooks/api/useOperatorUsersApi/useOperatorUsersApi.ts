import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FacesService } from '../../../api/services/FacesService';
import {
	fetchOperatorUserDetail,
	postOperatorGlobalBan,
	deleteOperatorGlobalBan,
	postOperatorFaceBan,
	deleteOperatorFaceBan,
	patchOperatorFaceRole,
} from '../../../api/operatorUsersApiClient';
import type { OperatorUserDetail, FaceRoleOption } from './types';
import { operatorUserDetailKey } from './constants';

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
