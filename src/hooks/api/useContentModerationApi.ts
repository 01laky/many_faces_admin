import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ADMIN_TABLE_PAGE_SIZE } from '../../utils/adminTableUtils';
import { parsePaginatedEnvelope, type ApiSortDir } from '../../utils/adminListQuery';
import { OpenAPI } from '../../api/core/OpenAPI';
import { request as __request } from '../../api/core/request';
import type {
	AiReviewStatus,
	AiReviewRiskLevel,
	BulkModerationAction,
	ContentApprovalStatus,
	ModeratedContentType,
} from '../../utils/contentModeration';

/**
 * Typed admin moderation API client (manual `__request` usage instead of regenerated OpenAPI clients).
 * Covers queue listing, per-item decisions, audit events, metrics (including wrapped `{ metrics, alerts }` payloads), and bulk actions.
 */
export interface ModerationItem {
	contentType: ModeratedContentType;
	contentId: number;
	title: string;
	faceId: number;
	faceTitle: string;
	creatorId: string;
	creatorName: string;
	approvalStatus: ContentApprovalStatus;
	aiReviewStatus: AiReviewStatus;
	aiReviewDecision: string;
	aiReviewConfidence?: number | null;
	aiReviewRiskLevel: string;
	aiReviewFlagsJson?: string | null;
	aiReviewReason?: string | null;
	aiReviewUserMessage?: string | null;
	aiReviewModelVersion?: string | null;
	aiReviewTraceId?: string | null;
	submittedAtUtc?: string | null;
	humanReviewedAtUtc?: string | null;
	humanDecisionReason?: string | null;
	removedAtUtc?: string | null;
	removalReason?: string | null;
	createdAt: string;
	/** SHV2 PI-8: plain-text body/description preview from API (never render as HTML). */
	bodyPreviewPlainText?: string;
	/** SHV2 PI-8: optional reel media URL preview. */
	mediaUrlPreview?: string | null;
}

export interface ModerationEvent {
	id: number;
	contentType: ModeratedContentType;
	contentId: number;
	faceId: number;
	oldApprovalStatus?: ContentApprovalStatus | null;
	newApprovalStatus?: ContentApprovalStatus | null;
	oldAiReviewStatus?: AiReviewStatus | null;
	newAiReviewStatus?: AiReviewStatus | null;
	actorType: string;
	actorUserId?: string | null;
	reason?: string | null;
	userMessage?: string | null;
	aiTraceId?: string | null;
	aiModelVersion?: string | null;
	createdAtUtc: string;
}

export interface ModerationFlagCount {
	flag: string;
	count: number;
}

export interface ModerationFacePending {
	faceId: number;
	faceTitle: string;
	pendingCount: number;
}

export interface ModerationAlert {
	code: string;
	severity: string;
	message: string;
}

export interface ModerationMetrics {
	pendingSubmissions: number;
	aiQueuedJobs: number;
	aiProcessingJobs: number;
	aiFailedJobs: number;
	oldestPendingSubmissionUtc?: string | null;
	oldestPendingAgeHours?: number | null;
	averageReviewLatencyHours?: number | null;
	p95ReviewLatencyHours?: number | null;
	approvedCount: number;
	rejectedCount: number;
	removedCount: number;
	recommendedApproveCount: number;
	recommendedRejectCount: number;
	needsHumanReviewCount: number;
	aiJobsLikelyTimeoutCount: number;
	topModerationFlags: ModerationFlagCount[];
	pendingSubmissionsByFace: ModerationFacePending[];
	alerts?: ModerationAlert[];
}

export interface ModerationFilters {
	contentType?: ModeratedContentType;
	approvalStatus?: ContentApprovalStatus;
	aiReviewStatus?: AiReviewStatus;
	faceId?: number;
	authorId?: string;
	riskLevel?: AiReviewRiskLevel;
	moderationVersion?: number;
	flagContains?: string;
	minConfidence?: number;
	maxConfidence?: number;
	submittedFromUtc?: string;
	submittedToUtc?: string;
	reviewedByUserId?: string;
	minQueueAgeHours?: number;
}

export interface ModerationListParams extends ModerationFilters {
	page?: number;
	pageSize?: number;
	sortBy?: string;
	sortDir?: ApiSortDir;
}

export interface ModerationListResponse {
	items: ModerationItem[];
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}

export interface ModerationDecision {
	reason?: string;
	userMessage?: string;
}

export interface BulkModerationPayload {
	action: BulkModerationAction;
	items: Array<Pick<ModerationItem, 'contentType' | 'contentId'>>;
	reason?: string;
	userMessage?: string;
}

export interface BulkModerationResult {
	contentType: ModeratedContentType;
	contentId: number;
	success: boolean;
	statusCode: number;
	message: string;
	approvalStatus?: string | null;
	aiReviewStatus?: string | null;
}

export const moderationKeys = {
	all: ['contentModeration'] as const,
	list: (params: ModerationListParams) => [...moderationKeys.all, 'list', params] as const,
	events: (contentType: ModeratedContentType, contentId: number) =>
		[...moderationKeys.all, 'events', contentType, contentId] as const,
	metrics: () => [...moderationKeys.all, 'metrics'] as const,
};

export async function fetchModerationItems(
	params: ModerationListParams = {}
): Promise<ModerationListResponse> {
	const page = params.page ?? 1;
	const pageSize = params.pageSize ?? ADMIN_TABLE_PAGE_SIZE;
	const { page: _p, pageSize: _ps, sortBy, sortDir, ...filters } = params;
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: '/api/contentmoderation',
		query: {
			...filters,
			page,
			pageSize,
			...(sortBy ? { sortBy, sortDir: sortDir ?? 'asc' } : {}),
		},
	});
	return parsePaginatedEnvelope<ModerationItem>(response, page, pageSize);
}

export async function applyModerationDecision(
	contentType: ModeratedContentType,
	contentId: number,
	action: 'approve' | 'reject' | 'remove',
	decision: ModerationDecision = {}
) {
	return __request(OpenAPI, {
		method: 'POST',
		url: `/api/contentmoderation/${contentType}/${contentId}/${action}`,
		body: decision,
	});
}

export async function fetchModerationEvents(contentType: ModeratedContentType, contentId: number) {
	return __request(OpenAPI, {
		method: 'GET',
		url: `/api/contentmoderation/${contentType}/${contentId}/events`,
	}) as Promise<ModerationEvent[]>;
}

/**
 * Normalizes `GET /api/contentmoderation/metrics` responses.
 * Newer backends return `{ metrics, alerts }`; older responses may be a flat metrics object—both are accepted.
 */
export function unwrapModerationMetricsResponse(raw: unknown): ModerationMetrics {
	if (raw == null || typeof raw !== 'object') {
		return {
			pendingSubmissions: 0,
			aiQueuedJobs: 0,
			aiProcessingJobs: 0,
			aiFailedJobs: 0,
			oldestPendingSubmissionUtc: null,
			oldestPendingAgeHours: null,
			averageReviewLatencyHours: null,
			p95ReviewLatencyHours: null,
			approvedCount: 0,
			rejectedCount: 0,
			removedCount: 0,
			recommendedApproveCount: 0,
			recommendedRejectCount: 0,
			needsHumanReviewCount: 0,
			aiJobsLikelyTimeoutCount: 0,
			topModerationFlags: [],
			pendingSubmissionsByFace: [],
			alerts: [],
		};
	}
	if ('metrics' in raw) {
		const wrapped = raw as { metrics: ModerationMetrics; alerts?: ModerationAlert[] };
		return {
			...wrapped.metrics,
			topModerationFlags: wrapped.metrics.topModerationFlags ?? [],
			pendingSubmissionsByFace: wrapped.metrics.pendingSubmissionsByFace ?? [],
			alerts: wrapped.alerts ?? [],
		};
	}
	const flat = raw as ModerationMetrics;
	return {
		...flat,
		topModerationFlags: flat.topModerationFlags ?? [],
		pendingSubmissionsByFace: flat.pendingSubmissionsByFace ?? [],
		alerts: flat.alerts ?? [],
	};
}

export async function fetchModerationMetrics() {
	const raw = await __request(OpenAPI, {
		method: 'GET',
		url: '/api/contentmoderation/metrics',
	});
	return unwrapModerationMetricsResponse(raw);
}

export async function applyBulkModeration(payload: BulkModerationPayload) {
	return __request(OpenAPI, {
		method: 'POST',
		url: '/api/contentmoderation/bulk',
		body: payload,
	}) as Promise<{ results: BulkModerationResult[] }>;
}

export function useModerationItems(params: ModerationListParams = {}, enabled = true) {
	return useQuery({
		queryKey: moderationKeys.list(params),
		queryFn: () => fetchModerationItems(params),
		enabled,
		staleTime: 30_000,
		placeholderData: keepPreviousData,
	});
}

export function useModerationAction() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			item,
			action,
			decision,
		}: {
			item: Pick<ModerationItem, 'contentType' | 'contentId'>;
			action: 'approve' | 'reject' | 'remove';
			decision?: ModerationDecision;
		}) => applyModerationDecision(item.contentType, item.contentId, action, decision),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: moderationKeys.all }),
	});
}

export function useBulkModerationAction() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: applyBulkModeration,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: moderationKeys.all }),
	});
}

export function useModerationEvents(
	item: Pick<ModerationItem, 'contentType' | 'contentId'> | null
) {
	return useQuery({
		queryKey: item
			? moderationKeys.events(item.contentType, item.contentId)
			: [...moderationKeys.all, 'events', 'none'],
		queryFn: () => fetchModerationEvents(item!.contentType, item!.contentId),
		enabled: Boolean(item),
		staleTime: 15_000,
	});
}

export function useModerationMetrics(enabled = true) {
	return useQuery({
		queryKey: moderationKeys.metrics(),
		queryFn: fetchModerationMetrics,
		enabled,
		staleTime: 30_000,
	});
}
