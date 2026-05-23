/** React Query hooks for super-admin user chat REST (/api/operator-user-chat/*). Gated on SUPER_ADMIN JWT. */
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import {
	fetchOperatorUserChatConversations,
	fetchOperatorUserChatHistory,
	fetchOperatorUserChatThreadExists,
	postOperatorUserChatRead,
	type OperatorUserChatHistoryPage,
} from '@/api/operatorUserChatApiClient';
import { isSuperAdminFromToken } from '@/utils/platformAccess';
import { useAuth } from '@/contexts/AuthContext';

export const operatorUserChatConversationsKey = ['operatorUserChat', 'conversations'] as const;
const messagesKey = (userId: string) => ['operatorUserChat', 'messages', userId] as const;
const existsKey = (userId: string) => ['operatorUserChat', 'exists', userId] as const;

export function useOperatorUserChatConversations() {
	const { token } = useAuth();
	return useQuery({
		queryKey: operatorUserChatConversationsKey,
		queryFn: () => fetchOperatorUserChatConversations(),
		enabled: Boolean(token) && isSuperAdminFromToken(token),
	});
}

export function useOperatorUserChatMessages(targetUserId: string | null, enabled: boolean) {
	const { token } = useAuth();
	return useQuery({
		queryKey: targetUserId ? messagesKey(targetUserId) : ['operatorUserChat', 'messages', 'none'],
		queryFn: () => fetchOperatorUserChatHistory(targetUserId!, { limit: 40 }),
		enabled: Boolean(token) && isSuperAdminFromToken(token) && enabled && Boolean(targetUserId),
		staleTime: 0,
		refetchOnMount: 'always',
	});
}

export function getOperatorUserChatMessagesNextPageParam(
	lastPage: OperatorUserChatHistoryPage
): number | undefined {
	return lastPage.hasMore && lastPage.items[0]?.id ? lastPage.items[0].id : undefined;
}

export function useOperatorUserChatMessagesInfinite(targetUserId: string | null, enabled: boolean) {
	const { token } = useAuth();
	return useInfiniteQuery({
		queryKey: targetUserId
			? [...messagesKey(targetUserId), 'infinite']
			: ['operatorUserChat', 'messages', 'none', 'infinite'],
		queryFn: ({ pageParam }) =>
			fetchOperatorUserChatHistory(targetUserId!, {
				limit: 40,
				beforeId: pageParam as number | undefined,
			}),
		initialPageParam: undefined as number | undefined,
		getNextPageParam: getOperatorUserChatMessagesNextPageParam,
		enabled: Boolean(token) && isSuperAdminFromToken(token) && enabled && Boolean(targetUserId),
		staleTime: 0,
	});
}

export function patchOperatorUserChatInfiniteFirstPage(
	data: InfiniteData<OperatorUserChatHistoryPage> | undefined,
	patch: (page: OperatorUserChatHistoryPage) => OperatorUserChatHistoryPage
) {
	if (!data?.pages?.length) return data;
	return { ...data, pages: [patch(data.pages[0]), ...data.pages.slice(1)] };
}

export function useOperatorUserChatThreadExists(targetUserId: string, enabled: boolean) {
	const { token } = useAuth();
	return useQuery({
		queryKey: existsKey(targetUserId),
		queryFn: () => fetchOperatorUserChatThreadExists(targetUserId),
		enabled: Boolean(token) && isSuperAdminFromToken(token) && enabled,
	});
}

export function useMarkOperatorUserChatRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (targetUserId: string) => postOperatorUserChatRead(targetUserId),
		onSuccess: (_data, targetUserId) => {
			void queryClient.invalidateQueries({ queryKey: messagesKey(targetUserId) });
			void queryClient.invalidateQueries({ queryKey: operatorUserChatConversationsKey });
		},
	});
}

export { messagesKey as operatorUserChatMessagesKey };
