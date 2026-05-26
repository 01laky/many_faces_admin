import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
	fetchAdminPushSettings,
	testAdminPushFcm,
	updateAdminPushSettings,
	type TestAdminPushFcmRequest,
	type UpdateAdminPushSettingsRequest,
} from '@/api/adminPushSettingsApiClient';
import type { AdminPushSettingsDto } from '@/api/models/AdminPushSettingsDto';
import { infraWorkerConfigQueryKey } from '@/hooks/api/useAdminInfraApi';
import { adminPushSettingsQueryKey } from './constants';

export function useAdminPushSettings() {
	const { token } = useAuth();
	return useQuery({
		queryKey: adminPushSettingsQueryKey,
		queryFn: () => fetchAdminPushSettings(token!),
		enabled: Boolean(token),
		staleTime: 30_000,
	});
}

export function useUpdateAdminPushSettings() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: UpdateAdminPushSettingsRequest) => updateAdminPushSettings(token!, body),
		onSuccess: (data: AdminPushSettingsDto) => {
			queryClient.setQueryData(adminPushSettingsQueryKey, data);
			void queryClient.invalidateQueries({ queryKey: infraWorkerConfigQueryKey });
		},
	});
}

export function useTestAdminPushFcm() {
	const { token } = useAuth();
	return useMutation({
		mutationFn: (body?: TestAdminPushFcmRequest) => testAdminPushFcm(token!, body),
	});
}

export type { AdminPushSettingsDto, TestAdminPushFcmRequest, UpdateAdminPushSettingsRequest };
