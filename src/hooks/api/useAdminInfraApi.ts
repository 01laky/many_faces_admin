import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
	getSearchHealth,
	getWorkerConfig,
	postMailerTestSelf,
	postPushTestSelf,
} from '@/api/services/adminInfraApi';

export const infraWorkerConfigQueryKey = ['infra-worker-config'] as const;
export const searchHealthQueryKey = ['search-health'] as const;

export function useInfraWorkerConfig() {
	const { token } = useAuth();
	return useQuery({
		queryKey: infraWorkerConfigQueryKey,
		queryFn: () => getWorkerConfig(token!),
		enabled: Boolean(token),
		staleTime: 60_000,
	});
}

export function useSearchHealth() {
	const { token } = useAuth();
	return useQuery({
		queryKey: searchHealthQueryKey,
		queryFn: () => getSearchHealth(token!),
		enabled: Boolean(token),
		staleTime: 30_000,
	});
}

export function useRefreshSearchHealth() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => getSearchHealth(token!),
		onSuccess: (data) => {
			queryClient.setQueryData(searchHealthQueryKey, data);
		},
	});
}

export function useMailerTestSelf() {
	const { token } = useAuth();
	return useMutation({
		mutationFn: () => postMailerTestSelf(token!),
	});
}

export function usePushTestSelf() {
	const { token } = useAuth();
	return useMutation({
		mutationFn: () => postPushTestSelf(token!),
	});
}
