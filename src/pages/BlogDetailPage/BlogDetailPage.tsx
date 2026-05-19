import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
	useBlog,
	useDeleteBlog,
	useDeleteBlogImage,
	useBlogModerationAction,
} from '@/hooks/api/useBlogsApi';
import { ContentMediaGrid } from '@/components/ContentMediaGrid/ContentMediaGrid';
import { ContentMediaPreviewModal } from '@/components/ContentMediaPreviewModal/ContentMediaPreviewModal';
import { AlbumDeleteReasonDialog } from '@/components/AlbumDeleteReasonDialog/AlbumDeleteReasonDialog';
import { ModerationPlainTextPreview } from '@/components/moderation/ModerationPlainTextPreview';
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
import { resolveBlogBodyPlainText } from '@/utils/blogContentPreview';
import { blogImagesToMediaItems } from '@/utils/blogDetailMedia';
import '../UserDetailPage/UserDetailPage.scss';

type DialogMode = 'deleteBlog' | 'deleteImage' | 'reject' | 'approveOverride' | null;

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

function formatConfidence(value: number | null | undefined): string {
	if (value == null || Number.isNaN(value)) return '—';
	return `${Math.round(value * 100)}%`;
}

export function BlogDetailPage() {
	const { id } = useParams<{ id: string }>();
	const [search] = useSearchParams();
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const blogId = id ? parseInt(id, 10) : 0;
	const faceId = parseInt(search.get('faceId') ?? '0', 10);
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const isSuperAdmin = isSuperAdminFromToken(token);

	const { data, isLoading, isError, error, refetch } = useBlog(blogId, faceId);
	const deleteBlog = useDeleteBlog();
	const deleteImage = useDeleteBlogImage();
	const moderation = useBlogModerationAction();

	const [previewIndex, setPreviewIndex] = useState<number | null>(null);
	const [dialogMode, setDialogMode] = useState<DialogMode>(null);
	const [pendingImageId, setPendingImageId] = useState<number | null>(null);

	const isLegacyRemoved = data?.approvalStatus === 'Removed';
	const canModerate = isPendingModeration(data?.approvalStatus) && !isLegacyRemoved;
	const needsApproveOverride = data?.aiReviewStatus === 'RecommendedReject';

	const mediaItems = useMemo(() => blogImagesToMediaItems(data?.images ?? []), [data?.images]);

	const bodyPlain = useMemo(
		() => resolveBlogBodyPlainText(data?.contentPlainText, data?.content),
		[data?.contentPlainText, data?.content]
	);

	const aiFlags = parseModerationFlags(data?.aiReviewFlagsJson).join(', ') || '—';
	const backPath = getLocalizedPath(`/faces/${faceId}`);

	const closeDialog = () => {
		setDialogMode(null);
		setPendingImageId(null);
	};

	const runDialogPayload = async (reason: string, userMessage: string) => {
		const payload = { faceId, reason, userMessage };
		if (dialogMode === 'deleteBlog') {
			await deleteBlog.mutateAsync({ blogId, payload });
			toast.success(t('pages.blogDetail.successDeleteBlog'));
			navigate(backPath);
			return;
		}
		if (dialogMode === 'deleteImage' && pendingImageId != null) {
			await deleteImage.mutateAsync({ blogId, imageId: pendingImageId, payload });
			toast.success(t('pages.blogDetail.successDeleteImage'));
			await refetch();
			setPreviewIndex(null);
			return;
		}
		if (dialogMode === 'reject') {
			await moderation.mutateAsync({
				blogId,
				faceId,
				action: 'reject',
				decision: { reason, userMessage },
			});
			toast.success(t('pages.blogDetail.successReject'));
			await refetch();
			return;
		}
		if (dialogMode === 'approveOverride') {
			await moderation.mutateAsync({
				blogId,
				faceId,
				action: 'approve',
				decision: { reason, userMessage: userMessage || reason },
			});
			toast.success(t('pages.blogDetail.successApprove'));
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
				blogId,
				faceId,
				action: 'approve',
				decision: { reason: t('pages.blogDetail.approveReasonDefault') },
			});
			toast.success(t('pages.blogDetail.successApprove'));
			await refetch();
		} catch (e) {
			const msg = mutationErrorMessage(e);
			if (msg.includes('Override reason')) {
				toast.error(t('pages.blogDetail.approveOverrideReasonRequired'));
			} else {
				toast.error(msg);
			}
		}
	};

	const dialogTitle = () => {
		switch (dialogMode) {
			case 'deleteBlog':
				return t('pages.blogDetail.deleteBlog');
			case 'deleteImage':
				return t('pages.blogDetail.deleteImage');
			case 'reject':
				return t('pages.blogDetail.reject');
			case 'approveOverride':
				return t('pages.blogDetail.approve');
			default:
				return '';
		}
	};

	const requireUserMessage = dialogMode !== 'approveOverride';

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
						<h2>{t('pages.blogDetail.title')}</h2>
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
						<h1>{t('pages.blogDetail.title')}</h1>
					</div>

					<div className="user-detail-card" data-testid="blog-detail-overview">
						<Row>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogsTable.colTitle')}</label>
									<p>{data.title}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.blogId')}</label>
									<p>{data.id}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.createdAt')}</label>
									<p>{formatDate(data.createdAt)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.updatedAt')}</label>
									<p>{formatDate(data.updatedAt)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.submittedAt')}</label>
									<p>{formatDate(data.submittedAtUtc)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.approvalStatus')}</label>
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
									<label>{t('pages.blogDetail.aiReviewStatus')}</label>
									<p>{formatValue(data.aiReviewStatus)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.creatorStatusLabel')}</label>
									<p>{formatValue(data.creatorStatusLabel)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.likesCount')}</label>
									<p>{data.likesCount ?? 0}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.commentsCount')}</label>
									<p>{data.commentsCount ?? 0}</p>
								</div>
							</Col>
							{data.creatorId && (
								<Col xs={12} md={6}>
									<div className="user-detail-field">
										<label>{t('pages.blogsTable.colCreator')}</label>
										<p>
											<Link
												to={getLocalizedPath(`/users/${data.creatorId}`)}
												className="link-primary"
											>
												{data.creatorName?.trim() || data.creatorId}
											</Link>
										</p>
									</div>
								</Col>
							)}
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.faceLabel')}</label>
									<p>
										<Link
											to={getLocalizedPath(`/faces/${data.faceId ?? faceId}`)}
											className="link-primary"
										>
											{data.faceTitle || data.faceId}
										</Link>
									</p>
								</div>
							</Col>
							{isLegacyRemoved && (
								<>
									<Col xs={12} md={6}>
										<div className="user-detail-field">
											<label>{t('pages.blogDetail.removedAt')}</label>
											<p>{formatDate(data.removedAtUtc)}</p>
										</div>
									</Col>
									<Col xs={12}>
										<div className="user-detail-field">
											<label>{t('pages.blogDetail.removalReason')}</label>
											<p>{formatValue(data.removalReason)}</p>
										</div>
									</Col>
									<Col xs={12}>
										<p className="text-muted">{t('pages.blogDetail.legacyRemovedHint')}</p>
									</Col>
								</>
							)}
						</Row>
					</div>

					<div className="user-detail-card" data-testid="blog-detail-content">
						<ModerationPlainTextPreview
							label={t('pages.blogDetail.contentSection')}
							value={bodyPlain || t('pages.blogDetail.contentEmpty')}
						/>
					</div>

					<div className="user-detail-card" data-testid="blog-detail-images">
						<h2 className="user-detail-section-title">{t('pages.blogDetail.imagesSection')}</h2>
						{mediaItems.length > 0 ? (
							<ContentMediaGrid
								items={mediaItems}
								showDelete={isSuperAdmin}
								onOpenPreview={(index) => setPreviewIndex(index)}
								onDeleteItem={(imageId) => {
									setPendingImageId(imageId);
									setDialogMode('deleteImage');
								}}
							/>
						) : (
							<p className="text-muted">{t('pages.blogDetail.imagesEmpty')}</p>
						)}
					</div>

					<div className="user-detail-card" data-testid="blog-detail-ai">
						<h2 className="user-detail-section-title">{t('pages.blogDetail.aiReviewSection')}</h2>
						<Row>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.aiReviewDecision')}</label>
									<p>{formatValue(data.aiReviewDecision)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.aiReviewRisk')}</label>
									<p>{formatValue(data.aiReviewRiskLevel)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.aiReviewConfidence')}</label>
									<p>{formatConfidence(data.aiReviewConfidence)}</p>
								</div>
							</Col>
							<Col xs={12}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.aiReviewFlags')}</label>
									<p>{aiFlags}</p>
								</div>
							</Col>
							<Col xs={12}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.aiReviewReason')}</label>
									<p>{formatValue(data.aiReviewReason)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.aiReviewModel')}</label>
									<p>{formatValue(data.aiReviewModelVersion)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.aiReviewTrace')}</label>
									<p>{formatValue(data.aiReviewTraceId)}</p>
								</div>
							</Col>
						</Row>
					</div>

					{isSuperAdmin && (
						<div className="user-detail-card">
							<h2 className="user-detail-section-title">
								{t('pages.blogDetail.moderationSection')}
							</h2>
							<div className="user-detail-action-buttons">
								{data.creatorId && (
									<Button
										variant="outline"
										onClick={() =>
											navigate(buildLocalizedUserChatPath(getLocalizedPath, data.creatorId!))
										}
									>
										{t('pages.blogDetail.openChat')}
									</Button>
								)}
								<Button
									variant="outline"
									onClick={() =>
										navigate(
											getLocalizedPath(
												`/content-moderation?contentType=Blog&faceId=${faceId}&contentId=${blogId}`
											)
										)
									}
								>
									{t('pages.blogDetail.openInQueue')}
								</Button>
								{canModerate && (
									<>
										<Button
											variant="outline"
											onClick={() => void handleApprove()}
											disabled={moderation.isPending}
										>
											{t('pages.blogDetail.approve')}
										</Button>
										<Button
											variant="outline"
											onClick={() => setDialogMode('reject')}
											disabled={moderation.isPending}
										>
											{t('pages.blogDetail.reject')}
										</Button>
									</>
								)}
								<Button
									variant="danger"
									onClick={() => setDialogMode('deleteBlog')}
									disabled={deleteBlog.isPending}
								>
									{t('pages.blogDetail.deleteBlog')}
								</Button>
							</div>
						</div>
					)}

					<div className="user-detail-card">
						<h2 className="user-detail-section-title">{t('pages.blogDetail.messagesSection')}</h2>
						<Row>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.aiReviewUserMessage')}</label>
									<p>{formatValue(data.aiReviewUserMessage)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.blogDetail.humanDecisionReason')}</label>
									<p>{formatValue(data.humanDecisionReason)}</p>
								</div>
							</Col>
						</Row>
					</div>
				</div>
			</Container>

			<ContentMediaPreviewModal
				show={previewIndex !== null && mediaItems.length > 0}
				items={mediaItems}
				index={previewIndex ?? 0}
				onIndexChange={setPreviewIndex}
				onClose={() => setPreviewIndex(null)}
				showDelete={isSuperAdmin}
				onDeleteCurrent={() => {
					const current = mediaItems[previewIndex ?? 0];
					if (current) {
						setPendingImageId(current.id);
						setDialogMode('deleteImage');
						setPreviewIndex(null);
					}
				}}
			/>
			<AlbumDeleteReasonDialog
				key={dialogMode ?? 'closed'}
				show={dialogMode !== null}
				title={dialogTitle()}
				onCancel={closeDialog}
				isSubmitting={deleteBlog.isPending || deleteImage.isPending || moderation.isPending}
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
