import { useMemo } from 'react';
import { Alert } from 'react-bootstrap';
import type { ColumnDef } from '@tanstack/react-table';
import {
	dashboardHasOperationalWarnings,
	shouldWarnAboutOldestPending,
} from '@/utils/contentModeration';
import type {
	ModerationFacePending,
	ModerationFlagCount,
	useModerationMetrics,
} from '@/hooks/api/useContentModerationApi';
import { ModerationMetricsBreakdownTable } from './ModerationMetricsBreakdownTable';

type MetricsData = NonNullable<ReturnType<typeof useModerationMetrics>['data']>;

interface ModerationMetricsPanelProps {
	metrics: MetricsData | undefined;
}

export function ModerationMetricsPanel({ metrics }: ModerationMetricsPanelProps) {
	const flagColumns = useMemo<ColumnDef<ModerationFlagCount, unknown>[]>(
		() => [
			{
				accessorKey: 'flag',
				header: 'Flag',
			},
			{
				accessorKey: 'count',
				header: 'Count',
			},
		],
		[]
	);

	const pendingByFaceColumns = useMemo<ColumnDef<ModerationFacePending, unknown>[]>(
		() => [
			{
				id: 'face',
				header: 'Face',
				cell: ({ row }) => (
					<>
						{row.original.faceTitle} (#{row.original.faceId})
					</>
				),
			},
			{
				accessorKey: 'pendingCount',
				header: 'Pending',
			},
		],
		[]
	);

	if (!metrics) return null;

	return (
		<>
			{dashboardHasOperationalWarnings({
				oldestPendingAgeHours: metrics.oldestPendingAgeHours,
				aiFailedJobs: metrics.aiFailedJobs,
				alerts: metrics.alerts,
			}) && (
				<Alert variant="warning" className="content-moderation-page__ops-banner">
					Operational attention recommended: review oldest pending age, failed AI jobs, and
					structured alerts below.
				</Alert>
			)}

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

			{(metrics.alerts?.length ?? 0) > 0 && (
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

			{(metrics.topModerationFlags?.length ?? 0) > 0 && (
				<section className="content-moderation-page__breakdown" aria-label="Top moderation flags">
					<h2 className="content-moderation-page__subsection-title">Top flags (pending)</h2>
					<ModerationMetricsBreakdownTable
						rows={metrics.topModerationFlags}
						columns={flagColumns}
						getRowId={(row) => row.flag}
					/>
				</section>
			)}

			{(metrics.pendingSubmissionsByFace?.length ?? 0) > 0 && (
				<section className="content-moderation-page__breakdown" aria-label="Pending by face">
					<h2 className="content-moderation-page__subsection-title">Pending by face</h2>
					<ModerationMetricsBreakdownTable
						rows={metrics.pendingSubmissionsByFace}
						columns={pendingByFaceColumns}
						getRowId={(row) => String(row.faceId)}
					/>
				</section>
			)}
		</>
	);
}
