import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
	createRegistrationInvite,
	listRegistrationInvites,
	resendRegistrationInviteEmail,
	revokeRegistrationInvite,
	type RegistrationInviteRow,
} from '@/api/services/registrationInvitesAdminApi';

export const registrationInvitesKeys = {
	all: ['registrationInvites'] as const,
	list: (skip: number, take: number) =>
		[...registrationInvitesKeys.all, 'list', skip, take] as const,
};

const DEFAULT_SKIP = 0;
const DEFAULT_TAKE = 50;

export function useRegistrationInvitesList(skip = DEFAULT_SKIP, take = DEFAULT_TAKE) {
	const { token } = useAuth();
	return useQuery({
		queryKey: registrationInvitesKeys.list(skip, take),
		queryFn: () => listRegistrationInvites(token!, skip, take),
		enabled: Boolean(token),
		staleTime: 60_000,
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
