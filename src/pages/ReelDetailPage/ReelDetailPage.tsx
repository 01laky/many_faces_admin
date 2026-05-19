import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useReel, useDeleteReel, useReelModerationAction } from '@/hooks/api/useReelsApi';
import { ContentMediaPreviewModal } from '@/components/ContentMediaPreviewModal/ContentMediaPreviewModal';
import { AlbumDeleteReasonDialog } from '@/components/AlbumDeleteReasonDialog/AlbumDeleteReasonDialog';
import { ModerationStatusChips } from '@/components/ModerationStatusChips';
import { Button } from '@/components/radix/Button';
import { useAuth } from '@/contexts/AuthContext';
import {
	isPendingModeration,
	isSuperAdminFromToken,
	parseModerationFlags,
} from '@/utils/contentModeration';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { buildLocalizedUserChatPath } from '@/utils/userChatPaths';
import { reelToPreviewItem } from '@/utils/reelDetailMedia';
import '../UserDetailPage/UserDetailPage.scss';

type DialogMode = 'deleteReel' | 'reject' | 'approveOverride' | null;

function mutationErrorMessage(error: unknown): string {
	if (error instanceof Error && error.message) return error.message;
	return 'Request failed';
}

function formatValue(value: string | number | null | undefined): string {
	if (value === null || value === undefined || value === '') return '—';
	return String(value);
}

function formatDate(value: string | null | undefined): string {
	if (!value) return '—';
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

export function ReelDetailPage() {
	const { id } = useParams<{ id: string }>();
	const [search] = useSearchParams();
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const reelId = id ? parseInt(id, 10) : 0;
	const faceId = parseInt(search.get('faceId') ?? '0', 10);
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const isSuperAdmin = isSuperAdminFromToken(token);

	const { data, isLoading, isError, error, refetch } = useReel(reelId, faceId);
	const deleteReel = useDeleteReel();
	const moderation = useReelModerationAction();

	const [previewOpen, setPreviewOpen] = useState(false);
	const [dialogMode, setDialogMode] = useState<DialogMode>(null);

	const canModerate = isPendingModeration(data?.approvalStatus);
	const needsApproveOverride = data?.aiReviewStatus === 'RecommendedReject';

	const previewItems = useMemo(
		() => (data ? [reelToPreviewItem(data.id, data.title, data.videoUrl)] : []),
		[data]
	);

	const closeDialog = () => setDialogMode(null);

	const runDialogPayload = async (reason: string, userMessage: string) => {
		const payload = { faceId, reason, userMessage };
		if (dialogMode === 'deleteReel') {
			await deleteReel.mutateAsync({ reelId, payload });
			toast.success(t('pages.reelDetail.successDeleteReel'));
			navigate(getLocalizedPath(`/faces/${faceId}`));
			return;
		}
		if (dialogMode === 'reject') {
			await moderation.mutateAsync({
				reelId,
				faceId,
				action: 'reject',
				decision: { reason, userMessage },
			});
			toast.success(t('pages.reelDetail.successReject'));
			await refetch();
			return;
		}
		if (dialogMode === 'approveOverride') {
			await moderation.mutateAsync({
				reelId,
				faceId,
				action: 'approve',
				decision: { reason, userMessage: userMessage || reason },
			});
			toast.success(t('pages.reelDetail.successApprove'));
			await refetch();
		}
	};

	const handleApprove = async () => {
		if (needsApproveOverride) {
			setDialogMode('approveOverride');
			return;
		}
		try {
			await moderation.mutateAsync({
				reelId,
				faceId,
				action: 'approve',
				decision: { reason: 'Approved from reel detail' },
			});
			toast.success(t('pages.reelDetail.successApprove'));
			await refetch();
		} catch (e) {
			const msg = mutationErrorMessage(e);
			if (msg.includes('Override reason')) {
				toast.error(t('pages.reelDetail.approveOverrideReasonRequired'));
			} else {
				toast.error(msg);
			}
		}
	};

	const dialogTitle = () => {
		switch (dialogMode) {
			case 'deleteReel':
				return t('pages.reelDetail.deleteReel');
			case 'reject':
				return t('pages.reelDetail.reject');
			case 'approveOverride':
				return t('pages.reelDetail.approve');
			default:
				return '';
		}
	};

	const requireUserMessage = dialogMode !== 'approveOverride';
	const backPath = getLocalizedPath(`/faces/${faceId}`);
	const aiFlags = parseModerationFlags(data?.aiReviewFlagsJson).join(', ') || '—';

	if (isLoading) {
		return (
			<div className="user-detail-page-wrapper" style={{ padding: '2rem' }}>
				<Container fluid>
					<div className="user-detail-loading">
						<p>{t('common.loading')}</p>
					</div>
				</Container>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="user-detail-page-wrapper" style={{ padding: '2rem' }}>
				<Container fluid>
					<div className="user-detail-error">
						<p>{error instanceof Error ? error.message : t('common.error')}</p>
						<Button onClick={() => navigate(backPath)}>{t('common.back')}</Button>
					</div>
				</Container>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="user-detail-page-wrapper" style={{ padding: '2rem' }}>
				<Container fluid>
					<div className="user-detail-not-found">
						<h2>{t('pages.reelDetail.title')}</h2>
						<Button onClick={() => navigate(backPath)}>{t('common.back')}</Button>
					</div>
				</Container>
			</div>
		);
	}

	return (
		<div className="user-detail-page-wrapper" style={{ padding: '2rem' }}>
			<Container fluid>
				<div className="user-detail-content">
					<div className="user-detail-header">
						<Button variant="outline" onClick={() => navigate(backPath)} className="back-button">
							← {t('common.back')}
						</Button>
						<h1>{t('pages.reelDetail.title')}</h1>
					</div>

					<div className="user-detail-card" data-testid="reel-detail-overview">
						<Row>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.reelsTable.colTitle')}</label>
									<p>{data.title}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.reelId')}</label>
									<p>{data.id}</p>
								</div>
							</Col>
							<Col xs={12}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.description')}</label>
									<p>{formatValue(data.description)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.createdAt')}</label>
									<p>{formatDate(data.createdAt)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.updatedAt')}</label>
									<p>{formatDate(data.updatedAt)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.submittedAt')}</label>
									<p>{formatDate(data.submittedAtUtc)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.approvalStatus')}</label>
									<p>
										<ModerationStatusChips
											approvalStatus={data.approvalStatus}
											aiReviewStatus={data.aiReviewStatus}
										/>
									</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.aiReviewStatus')}</label>
									<p>{formatValue(data.aiReviewStatus)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.creatorStatusLabel')}</label>
									<p>{formatValue(data.creatorStatusLabel)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.likesCount')}</label>
									<p>{data.likesCount ?? 0}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.commentsCount')}</label>
									<p>{data.commentsCount ?? 0}</p>
								</div>
							</Col>
							{data.creatorId && (
								<Col xs={12} md={6}>
									<div className="user-detail-field">
										<label>{t('pages.reelsTable.colCreator')}</label>
										<p>
											<Link
												to={getLocalizedPath(`/users/${data.creatorId}`)}
												className="link-primary"
											>
												{data.creatorName || data.creatorId}
											</Link>
										</p>
									</div>
								</Col>
							)}
							<Col xs={12}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.facesLabel')}</label>
									<p>
										{(data.faces ?? []).length > 0
											? (data.faces ?? []).map((f) => (
													<span key={f.faceId}>
														<Link
															to={getLocalizedPath(`/faces/${f.faceId}`)}
															className="link-primary me-2"
														>
															{f.title || f.faceId}
														</Link>
													</span>
												))
											: '—'}
									</p>
								</div>
							</Col>
						</Row>
					</div>

					<div className="user-detail-card" data-testid="reel-detail-video">
						<h2 className="user-detail-section-title">{t('pages.reelDetail.videoSection')}</h2>
						{data.videoUrl ? (
							<>
								<video
									src={data.videoUrl}
									controls
									playsInline
									preload="metadata"
									style={{ maxHeight: '70vh', width: '100%' }}
								/>
								<div className="user-detail-action-buttons mt-3">
									<Button variant="outline" onClick={() => setPreviewOpen(true)}>
										{t('pages.reelDetail.openPreview')}
									</Button>
									<a
										href={data.videoUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="btn btn-outline-secondary ms-2"
									>
										{t('pages.reelDetail.openVideoUrl')}
									</a>
								</div>
							</>
						) : (
							<p className="text-muted">{t('pages.reelDetail.videoEmpty')}</p>
						)}
					</div>

					<div className="user-detail-card" data-testid="reel-detail-ai">
						<h2 className="user-detail-section-title">{t('pages.reelDetail.aiReviewSection')}</h2>
						<Row>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.aiReviewDecision')}</label>
									<p>{formatValue(data.aiReviewDecision)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.aiReviewRisk')}</label>
									<p>{formatValue(data.aiReviewRiskLevel)}</p>
								</div>
							</Col>
							<Col xs={12}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.aiReviewFlags')}</label>
									<p>{aiFlags}</p>
								</div>
							</Col>
							<Col xs={12}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.aiReviewReason')}</label>
									<p>{formatValue(data.aiReviewReason)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.aiReviewModel')}</label>
									<p>{formatValue(data.aiReviewModelVersion)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.aiReviewTrace')}</label>
									<p>{formatValue(data.aiReviewTraceId)}</p>
								</div>
							</Col>
						</Row>
					</div>

					{isSuperAdmin && (
						<div className="user-detail-card">
							<h2 className="user-detail-section-title">
								{t('pages.reelDetail.moderationSection')}
							</h2>
							<div className="user-detail-action-buttons">
								{data.creatorId && (
									<Button
										variant="outline"
										onClick={() =>
											navigate(buildLocalizedUserChatPath(getLocalizedPath, data.creatorId!))
										}
									>
										{t('pages.reelDetail.openChat')}
									</Button>
								)}
								<Button
									variant="outline"
									onClick={() =>
										navigate(
											getLocalizedPath(
												`/content-moderation?contentType=Reel&faceId=${faceId}&contentId=${reelId}`
											)
										)
									}
								>
									{t('pages.reelDetail.openInQueue')}
								</Button>
								{canModerate && (
									<>
										<Button
											variant="outline"
											onClick={() => void handleApprove()}
											disabled={moderation.isPending}
										>
											{t('pages.reelDetail.approve')}
										</Button>
										<Button
											variant="outline"
											onClick={() => setDialogMode('reject')}
											disabled={moderation.isPending}
										>
											{t('pages.reelDetail.reject')}
										</Button>
									</>
								)}
								<Button
									variant="danger"
									onClick={() => setDialogMode('deleteReel')}
									disabled={deleteReel.isPending}
								>
									{t('pages.reelDetail.deleteReel')}
								</Button>
							</div>
						</div>
					)}

					<div className="user-detail-card">
						<h2 className="user-detail-section-title">{t('pages.reelDetail.messagesSection')}</h2>
						<Row>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.aiReviewUserMessage')}</label>
									<p>{formatValue(data.aiReviewUserMessage)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.reelDetail.humanDecisionReason')}</label>
									<p>{formatValue(data.humanDecisionReason)}</p>
								</div>
							</Col>
						</Row>
					</div>
				</div>
			</Container>

			<ContentMediaPreviewModal
				show={previewOpen && previewItems.length > 0}
				items={previewItems}
				index={0}
				onIndexChange={() => {}}
				onClose={() => setPreviewOpen(false)}
				showDelete={false}
			/>
			<AlbumDeleteReasonDialog
				key={dialogMode ?? 'closed'}
				show={dialogMode !== null}
				title={dialogTitle()}
				onCancel={closeDialog}
				isSubmitting={deleteReel.isPending || moderation.isPending}
				requireUserMessage={requireUserMessage}
				onConfirm={async (reason, userMessage) => {
					try {
						await runDialogPayload(reason, userMessage);
						closeDialog();
					} catch (e) {
						toast.error(mutationErrorMessage(e));
					}
				}}
			/>
		</div>
	);
}
