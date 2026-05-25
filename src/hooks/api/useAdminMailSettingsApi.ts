import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
	fetchAdminMailSettings,
	testAdminMailSmtp,
	updateAdminMailSettings,
	type UpdateAdminMailSettingsRequest,
} from '@/api/adminMailSettingsApiClient';
import type { AdminMailSettingsDto } from '@/api/models/AdminMailSettingsDto';
import { infraWorkerConfigQueryKey } from '@/hooks/api/useAdminInfraApi';

export const adminMailSettingsQueryKey = ['admin-mail-settings'] as const;

export function useAdminMailSettings() {
	const { token } = useAuth();
	return useQuery({
		queryKey: adminMailSettingsQueryKey,
		queryFn: () => fetchAdminMailSettings(token!),
		enabled: Boolean(token),
		staleTime: 30_000,
	});
}

export function useUpdateAdminMailSettings() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: UpdateAdminMailSettingsRequest) => updateAdminMailSettings(token!, body),
		onSuccess: (data: AdminMailSettingsDto) => {
			queryClient.setQueryData(adminMailSettingsQueryKey, data);
			void queryClient.invalidateQueries({ queryKey: infraWorkerConfigQueryKey });
		},
	});
}

export function useTestAdminMailSmtp() {
	const { token } = useAuth();
	return useMutation({
		mutationFn: () => testAdminMailSmtp(token!),
	});
}

export type { AdminMailSettingsDto, UpdateAdminMailSettingsRequest };
