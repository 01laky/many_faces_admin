import { Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatOptionalDate, parseModerationFlags } from '@/utils/contentModeration';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import {
	formatModerationBodyPreview,
	formatModerationMediaPreview,
} from '@/utils/moderationPreview';
import { ModerationPlainTextPreview } from '@/components/moderation/ModerationPlainTextPreview';

import type { ModerationItemDrawerProps } from './types';

export function ModerationItemDrawer({
	item,
	events,
	eventsLoading,
	onClose,
}: ModerationItemDrawerProps) {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();

	const openContentDetail = () => {
		if (item.contentType === 'Reel') {
			navigate(getLocalizedPath(`/reels/${item.contentId}?faceId=${item.faceId}`));
			return;
		}
		if (item.contentType === 'Album') {
			navigate(getLocalizedPath(`/albums/${item.contentId}?faceId=${item.faceId}`));
			return;
		}
		if (item.contentType === 'Blog') {
			navigate(getLocalizedPath(`/blogs/${item.contentId}?faceId=${item.faceId}`));
		}
	};

	return (
		<section className="content-moderation-page__detail" aria-label="Moderation detail">
			<div className="content-moderation-page__detail-header">
				<div>
					<h2>
						{item.contentType}: {item.title}
					</h2>
					<p>
						Submitted {formatOptionalDate(item.submittedAtUtc)} by{' '}
						{item.creatorName.trim() || item.creatorId}
					</p>
					{(item.contentType === 'Reel' ||
						item.contentType === 'Album' ||
						item.contentType === 'Blog') && (
						<Button
							variant="outline-primary"
							size="sm"
							className="mt-2"
							onClick={openContentDetail}
						>
							{item.contentType === 'Reel'
								? t('pages.moderation.openReelDetail')
								: item.contentType === 'Album'
									? t('pages.moderation.openAlbumDetail')
									: t('pages.moderation.openBlogDetail')}
						</Button>
					)}
				</div>
				<Button variant="outline-secondary" size="sm" onClick={onClose}>
					Close
				</Button>
			</div>
			<ModerationPlainTextPreview
				label="Body preview (plain text)"
				value={formatModerationBodyPreview(item.bodyPreviewPlainText)}
			/>
			{formatModerationMediaPreview(item.mediaUrlPreview) && (
				<ModerationPlainTextPreview
					label="Media URL"
					value={formatModerationMediaPreview(item.mediaUrlPreview)!}
				/>
			)}
			<div className="content-moderation-page__detail-grid">
				<div>
					<h3>AI recommendation</h3>
					<p>Status: {item.aiReviewStatus}</p>
					<p>Decision: {item.aiReviewDecision}</p>
					<p>Risk: {item.aiReviewRiskLevel}</p>
					<p>Flags: {parseModerationFlags(item.aiReviewFlagsJson).join(', ') || 'None'}</p>
					<p>Reason: {item.aiReviewReason || 'No AI reason yet.'}</p>
					<p>User message: {item.aiReviewUserMessage || 'Not set'}</p>
					<p>Model: {item.aiReviewModelVersion || 'Not set'}</p>
					<p>Trace: {item.aiReviewTraceId || 'Not set'}</p>
				</div>
				<div>
					<h3>Human moderation</h3>
					<p>Status: {item.approvalStatus}</p>
					<p>Reviewed: {formatOptionalDate(item.humanReviewedAtUtc)}</p>
					<p>Decision reason: {item.humanDecisionReason || 'Not set'}</p>
					<p>Removed: {formatOptionalDate(item.removedAtUtc)}</p>
					<p>Removal reason: {item.removalReason || 'Not set'}</p>
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
	);
}
