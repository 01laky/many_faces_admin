import { useMemo, useState } from 'react';
import { Alert, Button, Form, Spinner, Table } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import {
	useBulkModerationAction,
	useModerationAction,
	useModerationEvents,
	useModerationMetrics,
	useModerationItems,
	type ModerationItem,
} from '../hooks/api/useContentModerationApi';
import {
	AI_REVIEW_STATUSES,
	buildBulkModerationPayload,
	dashboardHasOperationalWarnings,
	formatOptionalDate,
	getModerationQueueLabel,
	isSuperAdminFromToken,
	parseModerationFlags,
	shouldWarnAboutOldestPending,
	type AiReviewRiskLevel,
	type AiReviewStatus,
	type BulkModerationAction,
	type ContentApprovalStatus,
	type ModeratedContentType,
} from '../utils/contentModeration';
import './ContentModerationPage.scss';

/**
 * SUPER_ADMIN moderation console: filterable queue, health metrics, structured alerts, bulk actions, and per-item audit drawer.
 */
const APPROVAL_FILTERS: Array<ContentApprovalStatus | ''> = [
	'PendingApproval',
	'Approved',
	'Rejected',
	'Removed',
	'',
];

const CONTENT_TYPES: Array<ModeratedContentType | ''> = ['Album', 'Blog', 'Reel', ''];
const RISK_FILTERS: Array<AiReviewRiskLevel | ''> = ['High', 'Medium', 'Low', 'Unknown', ''];

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

export function ContentModerationPage() {
	const { token } = useAuth();
	const isSuperAdmin = useMemo(() => isSuperAdminFromToken(token), [token]);
	const [contentType, setContentType] = useState<ModeratedContentType | ''>('');
	const [approvalStatus, setApprovalStatus] = useState<ContentApprovalStatus | ''>(
		'PendingApproval'
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

	// Derived query object passed to React Query; undefined keys are omitted by the request helper.
	const filters = {
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
	const { data, isLoading, error } = useModerationItems(filters, isSuperAdmin);
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
		const key = `${item.contentType}:${item.contentId}`;
		action.mutate({
			item,
			action: actionName,
			decision: { reason: reasonByItem[key] || `${actionName} from moderation queue` },
		});
	};

	const toggleSelected = (item: ModerationItem) => {
		const key = `${item.contentType}:${item.contentId}`;
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
				<div className="content-moderation-page__header-filters">
					<div className="content-moderation-page__filters">
						<Form.Select
							aria-label="Content type"
							value={contentType}
							onChange={(event) => setContentType(event.target.value as ModeratedContentType | '')}
						>
							{CONTENT_TYPES.map((value) => (
								<option key={value || 'all'} value={value}>
									{value || 'All content'}
								</option>
							))}
						</Form.Select>
						<Form.Select
							aria-label="Approval status"
							value={approvalStatus}
							onChange={(event) =>
								setApprovalStatus(event.target.value as ContentApprovalStatus | '')
							}
						>
							{APPROVAL_FILTERS.map((value) => (
								<option key={value || 'all'} value={value}>
									{value ? value.replace(/([a-z])([A-Z])/g, '$1 $2') : 'All statuses'}
								</option>
							))}
						</Form.Select>
						<Form.Select
							aria-label="AI review status"
							value={aiReviewStatus}
							onChange={(event) => setAiReviewStatus(event.target.value as AiReviewStatus | '')}
						>
							{AI_REVIEW_STATUSES.map((value) => (
								<option key={value || 'all'} value={value}>
									{value ? value.replace(/([a-z])([A-Z])/g, '$1 $2') : 'All AI states'}
								</option>
							))}
						</Form.Select>
						<Form.Select
							aria-label="AI risk level"
							value={riskLevel}
							onChange={(event) => setRiskLevel(event.target.value as AiReviewRiskLevel | '')}
						>
							{RISK_FILTERS.map((value) => (
								<option key={value || 'all'} value={value}>
									{value || 'All risks'}
								</option>
							))}
						</Form.Select>
						<Form.Control
							aria-label="Author id"
							placeholder="Author id"
							value={authorId}
							onChange={(event) => setAuthorId(event.target.value)}
						/>
					</div>
					<div className="content-moderation-page__filters content-moderation-page__filters--secondary">
						<Form.Control
							aria-label="Face id"
							placeholder="Face id"
							value={faceIdText}
							onChange={(event) => setFaceIdText(event.target.value)}
						/>
						<Form.Control
							aria-label="Moderation version"
							placeholder="Moderation version"
							value={moderationVersionText}
							onChange={(event) => setModerationVersionText(event.target.value)}
						/>
						<Form.Control
							aria-label="Flag contains"
							placeholder="Flag contains"
							value={flagContains}
							onChange={(event) => setFlagContains(event.target.value)}
						/>
						<Form.Control
							aria-label="Min AI confidence"
							placeholder="Min confidence (0–1)"
							value={minConfidenceText}
							onChange={(event) => setMinConfidenceText(event.target.value)}
						/>
						<Form.Control
							aria-label="Max AI confidence"
							placeholder="Max confidence (0–1)"
							value={maxConfidenceText}
							onChange={(event) => setMaxConfidenceText(event.target.value)}
						/>
						<Form.Control
							aria-label="Submitted from (UTC ISO)"
							placeholder="Submitted from (UTC ISO)"
							value={submittedFromUtc}
							onChange={(event) => setSubmittedFromUtc(event.target.value)}
						/>
						<Form.Control
							aria-label="Submitted to (UTC ISO)"
							placeholder="Submitted to (UTC ISO)"
							value={submittedToUtc}
							onChange={(event) => setSubmittedToUtc(event.target.value)}
						/>
						<Form.Control
							aria-label="Reviewed by user id"
							placeholder="Human reviewer user id"
							value={reviewedByUserId}
							onChange={(event) => setReviewedByUserId(event.target.value)}
						/>
						<Form.Control
							aria-label="Min queue age hours"
							placeholder="Min queue age (hours)"
							value={minQueueAgeHoursText}
							onChange={(event) => setMinQueueAgeHoursText(event.target.value)}
						/>
					</div>
				</div>
			</div>

			{metrics &&
				dashboardHasOperationalWarnings({
					oldestPendingAgeHours: metrics.oldestPendingAgeHours,
					aiFailedJobs: metrics.aiFailedJobs,
					alerts: metrics.alerts,
				}) && (
					<Alert variant="warning" className="content-moderation-page__ops-banner">
						Operational attention recommended: review oldest pending age, failed AI jobs, and
						structured alerts below.
					</Alert>
				)}

			{metrics && (
				<div className="content-moderation-page__metrics" aria-label="Moderation metrics">
					<div>
						<strong>{metrics.pendingSubmissions}</strong>
						<span>Pending</span>
					</div>
					<div>
						<strong>{metrics.aiQueuedJobs}</strong>
						<span>AI queued</span>
					</div>
					<div>
						<strong>{metrics.aiProcessingJobs}</strong>
						<span>AI processing</span>
					</div>
					<div>
						<strong>{metrics.aiFailedJobs}</strong>
						<span>AI failed</span>
					</div>
					<div
						className={
							shouldWarnAboutOldestPending(metrics.oldestPendingAgeHours) ? 'is-warning' : ''
						}
					>
						<strong>
							{metrics.oldestPendingAgeHours == null
								? '-'
								: `${Math.round(metrics.oldestPendingAgeHours)}h`}
						</strong>
						<span>Oldest pending</span>
					</div>
					<div>
						<strong>
							{metrics.averageReviewLatencyHours == null
								? '-'
								: `${metrics.averageReviewLatencyHours.toFixed(1)}h`}
						</strong>
						<span>Avg review latency</span>
					</div>
					<div>
						<strong>
							{metrics.p95ReviewLatencyHours == null
								? '-'
								: `${metrics.p95ReviewLatencyHours.toFixed(1)}h`}
						</strong>
						<span>P95 review latency</span>
					</div>
					<div>
						<strong>{metrics.needsHumanReviewCount}</strong>
						<span>Needs human review</span>
					</div>
					<div>
						<strong>{metrics.aiJobsLikelyTimeoutCount}</strong>
						<span>AI jobs (timeout-ish)</span>
					</div>
				</div>
			)}

			{metrics && (metrics.alerts?.length ?? 0) > 0 && (
				<section
					className="content-moderation-page__alerts"
					aria-label="Structured moderation alerts"
				>
					<h2 className="content-moderation-page__subsection-title">Alerts</h2>
					<ul>
						{(metrics.alerts ?? []).map((a) => (
							<li key={`${a.code}-${a.message}`}>
								<strong>{a.code}</strong> ({a.severity}): {a.message}
							</li>
						))}
					</ul>
				</section>
			)}

			{metrics && (metrics.topModerationFlags?.length ?? 0) > 0 && (
				<section className="content-moderation-page__breakdown" aria-label="Top moderation flags">
					<h2 className="content-moderation-page__subsection-title">Top flags (pending)</h2>
					<Table size="sm" bordered responsive>
						<thead>
							<tr>
								<th>Flag</th>
								<th>Count</th>
							</tr>
						</thead>
						<tbody>
							{metrics.topModerationFlags.map((row) => (
								<tr key={row.flag}>
									<td>{row.flag}</td>
									<td>{row.count}</td>
								</tr>
							))}
						</tbody>
					</Table>
				</section>
			)}

			{metrics && (metrics.pendingSubmissionsByFace?.length ?? 0) > 0 && (
				<section className="content-moderation-page__breakdown" aria-label="Pending by face">
					<h2 className="content-moderation-page__subsection-title">Pending by face</h2>
					<Table size="sm" bordered responsive>
						<thead>
							<tr>
								<th>Face</th>
								<th>Pending</th>
							</tr>
						</thead>
						<tbody>
							{metrics.pendingSubmissionsByFace.map((row) => (
								<tr key={row.faceId}>
									<td>
										{row.faceTitle} (#{row.faceId})
									</td>
									<td>{row.pendingCount}</td>
								</tr>
							))}
						</tbody>
					</Table>
				</section>
			)}

			<div className="content-moderation-page__bulk" aria-label="Bulk moderation controls">
				<strong>{selectedKeys.length} selected</strong>
				<Form.Select
					aria-label="Bulk action"
					value={bulkActionName}
					onChange={(event) => setBulkActionName(event.target.value as BulkModerationAction)}
				>
					<option value="Approve">Approve</option>
					<option value="Reject">Reject</option>
					<option value="Remove">Remove</option>
					<option value="RequeueAiReview">Requeue AI review</option>
				</Form.Select>
				<Form.Control
					aria-label="Bulk reason"
					placeholder="Shared reason for reject/remove/override"
					value={bulkReason}
					onChange={(event) => setBulkReason(event.target.value)}
				/>
				<Button
					variant="primary"
					disabled={selectedKeys.length === 0 || bulkAction.isPending}
					onClick={runBulkAction}
				>
					Apply bulk action
				</Button>
				{bulkResultSummary && <span>{bulkResultSummary}</span>}
			</div>

			{isLoading && <Spinner animation="border" />}
			{error && <Alert variant="danger">Failed to load moderation queue.</Alert>}

			<Table responsive hover className="content-moderation-page__table">
				<thead>
					<tr>
						<th>Select</th>
						<th>Type</th>
						<th>Title</th>
						<th>Face</th>
						<th>Author</th>
						<th>Status</th>
						<th>AI</th>
						<th>Reason</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{(data ?? []).map((item) => {
						const key = `${item.contentType}:${item.contentId}`;
						return (
							<tr key={key}>
								<td>
									<Form.Check
										aria-label={`Select ${item.contentType} ${item.contentId}`}
										checked={selectedKeys.includes(key)}
										onChange={() => toggleSelected(item)}
									/>
								</td>
								<td>{item.contentType}</td>
								<td>{item.title}</td>
								<td>{item.faceTitle || item.faceId}</td>
								<td>{item.creatorName.trim() || item.creatorId}</td>
								<td>{getModerationQueueLabel(item.approvalStatus, item.aiReviewStatus)}</td>
								<td>
									{item.aiReviewStatus}
									{item.aiReviewConfidence != null &&
										` (${Math.round(item.aiReviewConfidence * 100)}%)`}
									{parseModerationFlags(item.aiReviewFlagsJson).length > 0 &&
										` - ${parseModerationFlags(item.aiReviewFlagsJson).join(', ')}`}
								</td>
								<td>
									<Form.Control
										size="sm"
										value={reasonByItem[key] ?? ''}
										placeholder="Required for reject/remove and overrides"
										onChange={(event) =>
											setReasonByItem((prev) => ({ ...prev, [key]: event.target.value }))
										}
									/>
								</td>
								<td className="content-moderation-page__actions">
									<Button
										size="sm"
										variant="outline-secondary"
										onClick={() => setSelectedItem(item)}
									>
										Details
									</Button>
									<Button size="sm" variant="success" onClick={() => runAction(item, 'approve')}>
										Approve
									</Button>
									<Button size="sm" variant="warning" onClick={() => runAction(item, 'reject')}>
										Reject
									</Button>
									<Button size="sm" variant="danger" onClick={() => runAction(item, 'remove')}>
										Remove
									</Button>
								</td>
							</tr>
						);
					})}
					{!isLoading && (data ?? []).length === 0 && (
						<tr>
							<td colSpan={9}>No moderation items match the selected filters.</td>
						</tr>
					)}
				</tbody>
			</Table>

			{selectedItem && (
				<section className="content-moderation-page__detail" aria-label="Moderation detail">
					<div className="content-moderation-page__detail-header">
						<div>
							<h2>
								{selectedItem.contentType}: {selectedItem.title}
							</h2>
							<p>
								Submitted {formatOptionalDate(selectedItem.submittedAtUtc)} by{' '}
								{selectedItem.creatorName.trim() || selectedItem.creatorId}
							</p>
						</div>
						<Button variant="outline-secondary" size="sm" onClick={() => setSelectedItem(null)}>
							Close
						</Button>
					</div>
					<div className="content-moderation-page__detail-grid">
						<div>
							<h3>AI recommendation</h3>
							<p>Status: {selectedItem.aiReviewStatus}</p>
							<p>Decision: {selectedItem.aiReviewDecision}</p>
							<p>Risk: {selectedItem.aiReviewRiskLevel}</p>
							<p>
								Flags: {parseModerationFlags(selectedItem.aiReviewFlagsJson).join(', ') || 'None'}
							</p>
							<p>Reason: {selectedItem.aiReviewReason || 'No AI reason yet.'}</p>
							<p>User message: {selectedItem.aiReviewUserMessage || 'Not set'}</p>
							<p>Model: {selectedItem.aiReviewModelVersion || 'Not set'}</p>
							<p>Trace: {selectedItem.aiReviewTraceId || 'Not set'}</p>
						</div>
						<div>
							<h3>Human moderation</h3>
							<p>Status: {selectedItem.approvalStatus}</p>
							<p>Reviewed: {formatOptionalDate(selectedItem.humanReviewedAtUtc)}</p>
							<p>Decision reason: {selectedItem.humanDecisionReason || 'Not set'}</p>
							<p>Removed: {formatOptionalDate(selectedItem.removedAtUtc)}</p>
							<p>Removal reason: {selectedItem.removalReason || 'Not set'}</p>
						</div>
					</div>
					<h3>Audit history</h3>
					{eventsLoading && <Spinner animation="border" size="sm" />}
					<ul className="content-moderation-page__events">
						{(events ?? []).map((event) => (
							<li key={event.id}>
								<strong>{formatOptionalDate(event.createdAtUtc)}</strong> {event.actorType}:{' '}
								{event.oldApprovalStatus || '-'} / {event.oldAiReviewStatus || '-'} to{' '}
								{event.newApprovalStatus || '-'} / {event.newAiReviewStatus || '-'}
								{event.reason && <span> - {event.reason}</span>}
							</li>
						))}
						{!eventsLoading && (events ?? []).length === 0 && <li>No audit events yet.</li>}
					</ul>
				</section>
			)}
		</div>
	);
}
