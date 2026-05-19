import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { clampPageIndex, sortingStateToApi } from '@/utils/adminListQuery';
import { useAdminListSortValidationFeedback } from '@/hooks/useAdminListSortValidationFeedback';
import { Alert } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import {
	useBulkModerationAction,
	useModerationAction,
	useModerationEvents,
	useModerationMetrics,
	useModerationItems,
	type ModerationItem,
} from '@/hooks/api/useContentModerationApi';
import {
	buildBulkModerationPayload,
	buildModerationRowKey,
	isSuperAdminFromToken,
	type AiReviewRiskLevel,
	type AiReviewStatus,
	type BulkModerationAction,
	type ContentApprovalStatus,
	type ModeratedContentType,
} from '@/utils/contentModeration';
import { ModerationFilters } from './ModerationFilters';
import { ModerationItemDrawer } from './ModerationItemDrawer';
import { ModerationMetricsPanel } from './ModerationMetricsPanel';
import { ModerationQueueTable } from './ModerationQueueTable';
import './ContentModerationPage.scss';

/** Parses numeric filter text fields; empty input means "no filter" (undefined), invalid numbers are ignored. */
function parseOptionalInt(raw: string): number | undefined {
	const t = raw.trim();
	if (!t) return undefined;
	const n = Number(t);
	return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

/** Same as parseOptionalInt but keeps fractional values for confidence and hour-based filters. */
function parseOptionalDouble(raw: string): number | undefined {
	const t = raw.trim();
	if (!t) return undefined;
	const n = Number(t);
	return Number.isFinite(n) ? n : undefined;
}

/**
 * SUPER_ADMIN moderation console: filterable queue, health metrics, structured alerts, bulk actions, and per-item audit drawer.
 */
function parseUrlContentType(raw: string | null): ModeratedContentType | '' {
	if (raw === 'Album' || raw === 'Blog' || raw === 'Reel') return raw;
	return '';
}

export function ContentModerationPage() {
	const { token } = useAuth();
	const [searchParams] = useSearchParams();
	const isSuperAdmin = useMemo(() => isSuperAdminFromToken(token), [token]);
	const [contentType, setContentType] = useState<ModeratedContentType | ''>(() =>
		parseUrlContentType(searchParams.get('contentType'))
	);
	const [contentIdText] = useState(() => searchParams.get('contentId') ?? '');
	const [approvalStatus, setApprovalStatus] = useState<ContentApprovalStatus | ''>(() =>
		searchParams.get('contentId') ? '' : 'PendingApproval'
	);
	const [aiReviewStatus, setAiReviewStatus] = useState<AiReviewStatus | ''>('');
	const [riskLevel, setRiskLevel] = useState<AiReviewRiskLevel | ''>('');
	const [authorId, setAuthorId] = useState('');
	const [faceIdText, setFaceIdText] = useState('');
	const [moderationVersionText, setModerationVersionText] = useState('');
	const [flagContains, setFlagContains] = useState('');
	const [minConfidenceText, setMinConfidenceText] = useState('');
	const [maxConfidenceText, setMaxConfidenceText] = useState('');
	const [submittedFromUtc, setSubmittedFromUtc] = useState('');
	const [submittedToUtc, setSubmittedToUtc] = useState('');
	const [reviewedByUserId, setReviewedByUserId] = useState('');
	const [minQueueAgeHoursText, setMinQueueAgeHoursText] = useState('');
	const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
	const [reasonByItem, setReasonByItem] = useState<Record<string, string>>({});
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const [bulkActionName, setBulkActionName] = useState<BulkModerationAction>('Approve');
	const [bulkReason, setBulkReason] = useState('');
	const [bulkResultSummary, setBulkResultSummary] = useState<string | null>(null);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	});
	const [sorting, setSorting] = useState<SortingState>([{ id: 'submittedAtUtc', desc: true }]);

	const filters = {
		contentId: parseOptionalInt(contentIdText),
		contentType: contentType || undefined,
		approvalStatus: approvalStatus || undefined,
		aiReviewStatus: aiReviewStatus || undefined,
		riskLevel: riskLevel || undefined,
		authorId: authorId.trim() || undefined,
		faceId: parseOptionalInt(faceIdText),
		moderationVersion: parseOptionalInt(moderationVersionText),
		flagContains: flagContains.trim() || undefined,
		minConfidence: parseOptionalDouble(minConfidenceText),
		maxConfidence: parseOptionalDouble(maxConfidenceText),
		submittedFromUtc: submittedFromUtc.trim() || undefined,
		submittedToUtc: submittedToUtc.trim() || undefined,
		reviewedByUserId: reviewedByUserId.trim() || undefined,
		minQueueAgeHours: parseOptionalDouble(minQueueAgeHoursText),
	};
	const listParams = {
		...filters,
		...sortingStateToApi(sorting),
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
	};
	const { data, isLoading, error, isError } = useModerationItems(listParams, isSuperAdmin);

	useAdminListSortValidationFeedback(error, isError, setSorting);

	useEffect(() => {
		if (!data?.totalPages) return;
		const next = clampPageIndex(pagination.pageIndex, data.totalPages);
		if (next !== pagination.pageIndex) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- clamp page when server totalPages shrinks (§1.9)
			setPagination((p) => ({ ...p, pageIndex: next }));
		}
	}, [data?.totalPages, pagination.pageIndex]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- clear bulk selection when filters change
		setSelectedKeys([]);
		setPagination((p) => ({ ...p, pageIndex: 0 }));
	}, [
		contentType,
		approvalStatus,
		aiReviewStatus,
		riskLevel,
		authorId,
		faceIdText,
		moderationVersionText,
		flagContains,
		minConfidenceText,
		maxConfidenceText,
		submittedFromUtc,
		submittedToUtc,
		reviewedByUserId,
		minQueueAgeHoursText,
	]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- clear cross-page bulk selection
		setSelectedKeys([]);
	}, [pagination.pageIndex, sorting]);

	const { data: metrics } = useModerationMetrics(isSuperAdmin);
	const { data: events, isLoading: eventsLoading } = useModerationEvents(selectedItem);
	const action = useModerationAction();
	const bulkAction = useBulkModerationAction();

	if (!isSuperAdmin) {
		return (
			<div className="content-moderation-page">
				<Alert variant="warning">
					Content moderation is restricted to SUPER_ADMIN users in this phase.
				</Alert>
			</div>
		);
	}

	const runAction = (item: ModerationItem, actionName: 'approve' | 'reject' | 'remove') => {
		const key = buildModerationRowKey(item);
		action.mutate({
			item,
			action: actionName,
			decision: { reason: reasonByItem[key] || `${actionName} from moderation queue` },
		});
	};

	const toggleSelected = (item: ModerationItem) => {
		const key = buildModerationRowKey(item);
		setSelectedKeys((prev) =>
			prev.includes(key) ? prev.filter((value) => value !== key) : [...prev, key]
		);
	};

	const runBulkAction = () => {
		if (selectedKeys.length === 0) return;
		if (
			(bulkActionName === 'Reject' || bulkActionName === 'Remove') &&
			!window.confirm(`Apply ${bulkActionName.toLowerCase()} to ${selectedKeys.length} items?`)
		) {
			return;
		}
		bulkAction.mutate(buildBulkModerationPayload(bulkActionName, selectedKeys, bulkReason), {
			onSuccess: (response) => {
				const successCount = response.results.filter((result) => result.success).length;
				setBulkResultSummary(
					`${successCount}/${response.results.length} bulk operations succeeded.`
				);
				setSelectedKeys([]);
			},
		});
	};

	return (
		<div className="content-moderation-page">
			<div className="content-moderation-page__header">
				<div>
					<h1>Moderation</h1>
					<p>User-created albums, blogs and reels awaiting review.</p>
				</div>
				<ModerationFilters
					contentType={contentType}
					setContentType={setContentType}
					approvalStatus={approvalStatus}
					setApprovalStatus={setApprovalStatus}
					aiReviewStatus={aiReviewStatus}
					setAiReviewStatus={setAiReviewStatus}
					riskLevel={riskLevel}
					setRiskLevel={setRiskLevel}
					authorId={authorId}
					setAuthorId={setAuthorId}
					faceIdText={faceIdText}
					setFaceIdText={setFaceIdText}
					moderationVersionText={moderationVersionText}
					setModerationVersionText={setModerationVersionText}
					flagContains={flagContains}
					setFlagContains={setFlagContains}
					minConfidenceText={minConfidenceText}
					setMinConfidenceText={setMinConfidenceText}
					maxConfidenceText={maxConfidenceText}
					setMaxConfidenceText={setMaxConfidenceText}
					submittedFromUtc={submittedFromUtc}
					setSubmittedFromUtc={setSubmittedFromUtc}
					submittedToUtc={submittedToUtc}
					setSubmittedToUtc={setSubmittedToUtc}
					reviewedByUserId={reviewedByUserId}
					setReviewedByUserId={setReviewedByUserId}
					minQueueAgeHoursText={minQueueAgeHoursText}
					setMinQueueAgeHoursText={setMinQueueAgeHoursText}
				/>
			</div>

			<ModerationMetricsPanel metrics={metrics} />

			<ModerationQueueTable
				items={data?.items ?? []}
				totalCount={data?.totalCount ?? 0}
				totalPages={data?.totalPages ?? 0}
				pagination={pagination}
				onPaginationChange={setPagination}
				sorting={sorting}
				onSortingChange={(updater) => {
					setSorting(updater);
					setPagination((p) => ({ ...p, pageIndex: 0 }));
				}}
				isLoading={isLoading}
				error={error}
				selectedKeys={selectedKeys}
				reasonByItem={reasonByItem}
				bulkActionName={bulkActionName}
				bulkReason={bulkReason}
				bulkResultSummary={bulkResultSummary}
				bulkActionPending={bulkAction.isPending}
				onReasonChange={(key, reason) => setReasonByItem((prev) => ({ ...prev, [key]: reason }))}
				onToggleSelected={toggleSelected}
				onSelectItem={setSelectedItem}
				onRunAction={runAction}
				onBulkActionNameChange={setBulkActionName}
				onBulkReasonChange={setBulkReason}
				onRunBulkAction={runBulkAction}
			/>

			{selectedItem && (
				<ModerationItemDrawer
					item={selectedItem}
					events={events}
					eventsLoading={eventsLoading}
					onClose={() => setSelectedItem(null)}
				/>
			)}
		</div>
	);
}
