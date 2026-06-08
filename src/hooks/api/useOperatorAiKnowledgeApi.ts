import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/api';
import {
	getOperatorAiKnowledgeStatus,
	reindexOperatorAiKnowledge,
	OPERATOR_AI_KNOWLEDGE_EXPECTED_DOC_COUNT,
	type OperatorAiKnowledgeReindexResult,
	type OperatorAiKnowledgeStatus,
} from '@/api/services/operatorAiKnowledgeApi';

// Re-export the service-layer types + constant so page components consume them via the hooks layer
// (the `lint:pages-api` rule forbids `src/pages/**/*.tsx` from importing `@/api/services/*` directly).
export {
	OPERATOR_AI_KNOWLEDGE_EXPECTED_DOC_COUNT,
	type OperatorAiKnowledgeReindexResult,
	type OperatorAiKnowledgeStatus,
};

/**
 * React Query hooks for the operator-AI knowledge index (RAG retrieval refactor v1).
 *
 * `useOperatorAiKnowledgeStatus` powers the read-only health panel (§17.9); the reindex mutation
 * backs the "Reindex knowledge" button (§8.1) and refreshes the status query on success so the
 * panel reflects the new doc count / last-indexed time immediately.
 */

export const operatorAiKnowledgeStatusQueryKey = ['operatorAi', 'knowledgeStatus'] as const;

/** Returns true when an error is a 409 — the single-flight "reindex already running" case (§17.5). */
export function isReindexAlreadyRunningError(error: unknown): boolean {
	return error instanceof ApiError && error.status === 409;
}

/**
 * Polls the knowledge-index status for the admin health panel.
 * Only enabled while AI is globally on — the index is irrelevant when AI is disabled.
 */
export function useOperatorAiKnowledgeStatus(enabled = true) {
	const { token } = useAuth();
	return useQuery<OperatorAiKnowledgeStatus>({
		queryKey: operatorAiKnowledgeStatusQueryKey,
		queryFn: () => getOperatorAiKnowledgeStatus(token!),
		enabled: Boolean(token) && enabled,
		staleTime: 15_000,
	});
}

/**
 * Forces a full knowledge reindex. On success the cached status is invalidated so the panel
 * re-reads the fresh doc count / last-indexed time. A thrown 409 (already running) is left for the
 * caller to detect via {@link isReindexAlreadyRunningError}.
 */
export function useReindexOperatorAiKnowledge() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation<OperatorAiKnowledgeReindexResult, unknown, void>({
		mutationFn: () => reindexOperatorAiKnowledge(token!),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: operatorAiKnowledgeStatusQueryKey });
		},
	});
}
