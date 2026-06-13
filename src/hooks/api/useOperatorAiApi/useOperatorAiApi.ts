import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
	createOperatorAiConversation,
	deleteOperatorAiConversation,
	getOperatorAiMessages,
	getOperatorAiModelStatus,
	getOperatorAiWorkerHost,
	listOperatorAiConversations,
	refreshOperatorAiWorkerHost,
	getOperatorAiLiveStatsCacheSettings,
	updateOperatorAiLiveStatsCacheSettings,
	getOperatorAiPublicStatsSettings,
	updateOperatorAiPublicStatsSettings,
	getOperatorAiSystemSettings,
	updateOperatorAiSystemSettings,
	type OperatorAiConversationListItem,
	type OperatorAiMessagesPage,
} from '@/api/services/operatorAiApi';

export type {
	OperatorAiConversationListItem,
	OperatorAiMessagesPage,
	OperatorAiMessageAppendedEvent,
} from '@/api/services/operatorAiApi';

export const operatorAiConversationsQueryKey = ['operatorAi', 'conversations'] as const;
const conversationsKey = operatorAiConversationsQueryKey;
const messagesKey = (id: number) => ['operatorAi', 'messages', id] as const;
export const operatorAiModelStatusQueryKey = ['operatorAi', 'modelStatus'] as const;
export const operatorAiWorkerHostQueryKey = ['operatorAi', 'workerHost'] as const;
export const operatorAiLiveStatsCacheQueryKey = ['operatorAi', 'liveStatsCache'] as const;
export const operatorAiPublicStatsSettingsQueryKey = ['operatorAi', 'publicStatsSettings'] as const;
/** Singleton global AI toggle — shared preload from AdminLayout (~30s coalescing). */
export const operatorAiSystemSettingsQueryKey = ['operatorAi', 'systemSettings'] as const;

export function useOperatorAiConversations() {
	const { token } = useAuth();
	return useQuery({
		queryKey: conversationsKey,
		queryFn: () => listOperatorAiConversations(token!),
		enabled: Boolean(token),
	});
}

export function useOperatorAiMessages(conversationId: number | null, enabled: boolean) {
	const { token } = useAuth();
	return useQuery({
		queryKey:
			conversationId != null ? messagesKey(conversationId) : ['operatorAi', 'messages', 'none'],
		queryFn: () => getOperatorAiMessages(token!, conversationId!),
		enabled: Boolean(token) && enabled && conversationId != null,
		staleTime: 0,
		refetchOnMount: 'always',
	});
}

export function getOperatorAiMessagesNextPageParam(
	lastPage: OperatorAiMessagesPage
): number | undefined {
	if (!lastPage.hasMore) return undefined;
	// Prefer the server-provided oldestId cursor (robust to ordering / an empty-but-hasMore page);
	// fall back to the first (oldest) item id. `!= null` so a legitimate id 0 doesn't stop pagination.
	const cursor = lastPage.oldestId ?? lastPage.items?.[0]?.id;
	return cursor != null ? cursor : undefined;
}

/** Paginated thread history — latest page first, `fetchNextPage` loads older (`beforeId`). */
export function useOperatorAiMessagesInfinite(conversationId: number | null, enabled: boolean) {
	const { token } = useAuth();
	return useInfiniteQuery({
		queryKey:
			conversationId != null
				? [...messagesKey(conversationId), 'infinite']
				: ['operatorAi', 'messages', 'none', 'infinite'],
		queryFn: ({ pageParam }) =>
			getOperatorAiMessages(
				token!,
				conversationId!,
				pageParam != null ? { beforeId: pageParam as number } : undefined
			),
		initialPageParam: undefined as number | undefined,
		getNextPageParam: getOperatorAiMessagesNextPageParam,
		enabled: Boolean(token) && enabled && conversationId != null,
		staleTime: 0,
	});
}

export function patchOperatorAiInfiniteFirstPage(
	data: InfiniteData<OperatorAiMessagesPage> | undefined,
	patch: (page: OperatorAiMessagesPage) => OperatorAiMessagesPage
) {
	if (!data?.pages?.length) return data;
	return { ...data, pages: [patch(data.pages[0]), ...data.pages.slice(1)] };
}

/** Poll model status while AI is enabled — avoids chatter when globally off. */
export function useOperatorAiModelStatus(operatorAiGloballyEnabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: operatorAiModelStatusQueryKey,
		queryFn: () => getOperatorAiModelStatus(token!),
		enabled: Boolean(token) && operatorAiGloballyEnabled,
		staleTime: 0,
		refetchOnMount: 'always',
		refetchInterval: (query) => {
			const data = query.state.data;
			if (!operatorAiGloballyEnabled) return false;
			if (data?.ready) return 20_000;
			if (data?.unavailable) return 10_000;
			return 3_000;
		},
	});
}

export function useOperatorAiWorkerHostProfile() {
	const { token } = useAuth();
	return useQuery({
		queryKey: operatorAiWorkerHostQueryKey,
		queryFn: () => getOperatorAiWorkerHost(token!),
		enabled: Boolean(token),
		staleTime: 60_000,
	});
}

export function useRefreshOperatorAiWorkerHostProfile() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => refreshOperatorAiWorkerHost(token!),
		onSuccess: (data) => {
			queryClient.setQueryData(operatorAiWorkerHostQueryKey, data);
		},
	});
}

export function useOperatorAiLiveStatsCacheSettings() {
	const { token } = useAuth();
	return useQuery({
		queryKey: operatorAiLiveStatsCacheQueryKey,
		queryFn: () => getOperatorAiLiveStatsCacheSettings(token!),
		enabled: Boolean(token),
		staleTime: 60_000,
	});
}

export function useUpdateOperatorAiLiveStatsCacheSettings() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: { ttlMilliseconds: number }) =>
			updateOperatorAiLiveStatsCacheSettings(token!, body),
		onSuccess: (data) => {
			queryClient.setQueryData(operatorAiLiveStatsCacheQueryKey, data);
		},
	});
}

export function useOperatorAiPublicStatsSettings() {
	const { token } = useAuth();
	return useQuery({
		queryKey: operatorAiPublicStatsSettingsQueryKey,
		queryFn: () => getOperatorAiPublicStatsSettings(token!),
		enabled: Boolean(token),
		staleTime: 60_000,
	});
}

/** Global AI master switch singleton (GET cached across layout/pages). */
export function useOperatorAiSystemSettings() {
	const { token } = useAuth();
	return useQuery({
		queryKey: operatorAiSystemSettingsQueryKey,
		queryFn: () => getOperatorAiSystemSettings(token!),
		enabled: Boolean(token),
		staleTime: 30_000,
		refetchOnWindowFocus: true,
	});
}

export function useUpdateOperatorAiSystemSettings() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: { aiEnabled: boolean }) => updateOperatorAiSystemSettings(token!, body),
		onSuccess: (data) => {
			queryClient.setQueryData(operatorAiSystemSettingsQueryKey, data);
			void queryClient.invalidateQueries({ queryKey: operatorAiModelStatusQueryKey });
			void queryClient.invalidateQueries({ queryKey: operatorAiWorkerHostQueryKey });
			void queryClient.invalidateQueries({ queryKey: operatorAiPublicStatsSettingsQueryKey });
		},
	});
}

export function useUpdateOperatorAiPublicStatsSettings() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: { publicStatsMode: string; liveMaxParallelBundleCalls: number }) =>
			updateOperatorAiPublicStatsSettings(token!, body),
		onSuccess: (data) => {
			queryClient.setQueryData(operatorAiPublicStatsSettingsQueryKey, data);
		},
	});
}

export function useCreateOperatorAiConversation() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => createOperatorAiConversation(token!),
		onSuccess: (created: OperatorAiConversationListItem) => {
			queryClient.setQueryData<OperatorAiConversationListItem[]>(conversationsKey, (prev) =>
				prev ? [created, ...prev.filter((c) => c.id !== created.id)] : [created]
			);
		},
	});
}

export function useDeleteOperatorAiConversation() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deleteOperatorAiConversation(token!, id),
		onSuccess: (_void, id) => {
			queryClient.setQueryData<OperatorAiConversationListItem[]>(conversationsKey, (prev) =>
				prev ? prev.filter((c) => c.id !== id) : []
			);
			queryClient.removeQueries({ queryKey: messagesKey(id) });
		},
	});
}

export function operatorAiQueryKeys() {
	return { conversationsKey, messagesKey };
}
