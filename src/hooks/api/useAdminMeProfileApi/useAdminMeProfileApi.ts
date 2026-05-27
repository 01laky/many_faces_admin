import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	fetchAdminMeProfile,
	patchAdminMeFaceRole,
	resendAdminMeEmailConfirmation,
	updateAdminMePassword,
	updateAdminMeProfile,
	uploadAdminMeAvatar,
	type AdminMeProfile,
	type UpdateAdminMePasswordBody,
	type UpdateAdminMeProfileBody,
} from '@/api/adminMeProfileApiClient';
import { useFaceRoles } from '@/hooks/api/useOperatorUsersApi';
import { applyOptimisticFaceRolePatch } from '@/utils/applyOptimisticFaceRolePatch';
import { adminMeProfileQueryKey } from './constants';

export function useAdminMeProfile(enabled = true) {
	return useQuery({
		queryKey: adminMeProfileQueryKey,
		queryFn: fetchAdminMeProfile,
		enabled,
		staleTime: 5 * 60 * 1000,
	});
}

export { useFaceRoles };

export function useAdminMeProfileMutations() {
	const queryClient = useQueryClient();
	const invalidate = () => queryClient.invalidateQueries({ queryKey: adminMeProfileQueryKey });

	const updateProfile = useMutation({
		mutationFn: (body: UpdateAdminMeProfileBody) => updateAdminMeProfile(body),
		onSuccess: invalidate,
	});

	const updatePassword = useMutation({
		mutationFn: (body: UpdateAdminMePasswordBody) => updateAdminMePassword(body),
	});

	const patchFaceRole = useMutation({
		mutationFn: ({
			faceId,
			userRoleId,
		}: {
			faceId: number;
			userRoleId: number;
			roleName: string | null;
		}) => patchAdminMeFaceRole(faceId, userRoleId),
		onMutate: async ({ faceId, userRoleId, roleName }) => {
			await queryClient.cancelQueries({ queryKey: adminMeProfileQueryKey });
			const previous = queryClient.getQueryData<AdminMeProfile>(adminMeProfileQueryKey);
			if (previous) {
				queryClient.setQueryData(
					adminMeProfileQueryKey,
					applyOptimisticFaceRolePatch(previous, faceId, userRoleId, roleName)
				);
			}
			return { previous };
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				queryClient.setQueryData(adminMeProfileQueryKey, context.previous);
			}
		},
		onSettled: invalidate,
	});

	const resendEmailConfirmation = useMutation({
		mutationFn: () => resendAdminMeEmailConfirmation(),
		onSuccess: invalidate,
	});

	const uploadAvatar = useMutation({
		mutationFn: (file: File) => uploadAdminMeAvatar(file),
		onSuccess: invalidate,
	});

	return {
		updateProfile,
		updatePassword,
		patchFaceRole,
		resendEmailConfirmation,
		uploadAvatar,
	};
}

export type { AdminMeProfile };
