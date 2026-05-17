import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
	createOperatorAiConversation,
	deleteOperatorAiConversation,
	getOperatorAiMessages,
	getOperatorAiModelStatus,
	listOperatorAiConversations,
	type OperatorAiConversationListItem,
} from '@/api/services/operatorAiApi';

export const operatorAiConversationsQueryKey = ['operatorAi', 'conversations'] as const;
const conversationsKey = operatorAiConversationsQueryKey;
const messagesKey = (id: number) => ['operatorAi', 'messages', id] as const;
export const operatorAiModelStatusQueryKey = ['operatorAi', 'modelStatus'] as const;

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

export function useOperatorAiModelStatus() {
	const { token } = useAuth();
	return useQuery({
		queryKey: operatorAiModelStatusQueryKey,
		queryFn: () => getOperatorAiModelStatus(token!),
		enabled: Boolean(token),
		staleTime: 0,
		refetchOnMount: 'always',
		refetchInterval: (query) => {
			const data = query.state.data;
			if (data?.ready) return false;
			if (data?.unavailable) return 10_000;
			return 3_000;
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
