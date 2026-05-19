import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import {
	createRegistrationInvite,
	listRegistrationInvites,
	resendRegistrationInviteEmail,
	revokeRegistrationInvite,
	type RegistrationInviteListParams,
	type RegistrationInviteRow,
} from '@/api/services/registrationInvitesAdminApi';

export const registrationInvitesKeys = {
	all: ['registrationInvites'] as const,
	list: (params: RegistrationInviteListParams) =>
		[...registrationInvitesKeys.all, 'list', params] as const,
};

export function useRegistrationInvitesList(params: RegistrationInviteListParams = {}) {
	const { token } = useAuth();
	const queryParams = {
		page: params.page ?? 1,
		pageSize: params.pageSize ?? ADMIN_TABLE_PAGE_SIZE,
		sortBy: params.sortBy,
		sortDir: params.sortDir,
		status: params.status,
		emailContains: params.emailContains,
	};
	return useQuery({
		queryKey: registrationInvitesKeys.list(queryParams),
		queryFn: () => listRegistrationInvites(token!, queryParams),
		enabled: Boolean(token),
		staleTime: 60_000,
		placeholderData: keepPreviousData,
	});
}

export function useCreateRegistrationInvite() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: { email: string; firstName?: string; lastName?: string }) =>
			createRegistrationInvite(token!, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: registrationInvitesKeys.all });
		},
	});
}

export function useResendRegistrationInviteEmail() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (email: string) => resendRegistrationInviteEmail(token!, email),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: registrationInvitesKeys.all });
		},
	});
}

export function useRevokeRegistrationInvite() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => revokeRegistrationInvite(token!, id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: registrationInvitesKeys.all });
		},
	});
}

export function isPendingInviteStatus(status: string): boolean {
	return status.toLowerCase() === 'pending';
}

export type { RegistrationInviteRow };
