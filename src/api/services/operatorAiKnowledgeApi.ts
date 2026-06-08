import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

/**
 * Hand-written typed client for the operator-AI knowledge-index endpoints
 * (`/admin/api/operator-ai/knowledge/*`) introduced by the RAG retrieval refactor (v1).
 *
 * These two endpoints are added by the backend slice in parallel and are NOT yet present in
 * the generated OpenAPI client (`src/api/services/*Service.ts`). Once the backend ships and the
 * generator is re-run against a live swagger, this thin wrapper can be folded into the generated
 * client — until then it keeps the admin SPA self-contained and type-safe.
 *
 * Shapes mirror the spec (§8.1 reindex result and §17.9 / §5.2 `KnowledgeIndexStatus`). The AI
 * itself is locale-free (D10); these are read/maintenance endpoints, not chat.
 */

/** Result of a forced knowledge reindex (`RebuildAsync(force:true)`) — spec §8.1. */
export interface OperatorAiKnowledgeReindexResult {
	/** Number of `KnowledgeDocument`s successfully (re)embedded + upserted. */
	indexedCount: number;
	/** Number of documents that failed to index this run. */
	failedCount: number;
	/** Embedding model used for this rebuild, e.g. `nomic-embed-text`. */
	embedModelVersion: string;
	/** UTC ISO timestamp the rebuild finished, when the backend reports it. */
	lastIndexedAtUtc?: string | null;
}

/** Read-only health/readiness of the operator-AI knowledge index — spec §5.2 / §17.9. */
export interface OperatorAiKnowledgeStatus {
	/** Read alias the live retrieval path targets, e.g. `operator-ai-knowledge`. */
	alias: string;
	/** Concrete versioned index the alias currently points at, e.g. `operator-ai-knowledge-v3`. */
	activeIndex: string;
	/** Documents currently in the active index. Compare against {@link expectedDocCount}. */
	docCount: number;
	/** Expected document count for a healthy index (the 61 fixed stat bundles in v1). */
	expectedDocCount: number;
	/** Embedding model the index was built with. */
	embedModelVersion: string;
	/** Dense-vector dimensionality of the index mapping. */
	vectorDim: number;
	/** True when the index is built and usable for retrieval (alias + count + model all match). */
	ready: boolean;
	/** True when only one retriever (kNN or BM25) is currently available. */
	degraded: boolean;
	/** UTC ISO timestamp of the last successful (re)index, or null if never indexed. */
	lastIndexedAtUtc?: string | null;
}

/** v1 indexes exactly the 61 fixed entity stat bundles (spec §4 rule 1 / §17.9 "doc count vs 61"). */
export const OPERATOR_AI_KNOWLEDGE_EXPECTED_DOC_COUNT = 61;

/**
 * Forces a full rebuild of the operator-AI knowledge index.
 * Backend: `POST /admin/api/operator-ai/knowledge/reindex` (`CanManageAllFaces`).
 * Returns HTTP 409 when a rebuild is already running (single-flight lock, §17.5) — callers should
 * inspect the thrown {@link ApiError.status} to surface an "already running" message.
 */
export async function reindexOperatorAiKnowledge(
	token: string
): Promise<OperatorAiKnowledgeReindexResult> {
	OpenAPI.TOKEN = token;
	return __request(OpenAPI, {
		method: 'POST',
		url: '/admin/api/operator-ai/knowledge/reindex',
	});
}

/**
 * Fetches the read-only knowledge-index health/readiness panel data.
 * Backend: `GET /admin/api/operator-ai/knowledge/status` (`CanManageAllFaces`).
 */
export async function getOperatorAiKnowledgeStatus(
	token: string
): Promise<OperatorAiKnowledgeStatus> {
	OpenAPI.TOKEN = token;
	return __request(OpenAPI, {
		method: 'GET',
		url: '/admin/api/operator-ai/knowledge/status',
	});
}
