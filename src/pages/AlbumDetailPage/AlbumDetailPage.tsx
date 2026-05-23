import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
	useAlbum,
	useDeleteAlbum,
	useDeleteAlbumMedia,
	useAlbumModerationAction,
} from '@/hooks/api/useAlbumsApi';
import { ContentMediaGrid } from '@/components/ContentMediaGrid/ContentMediaGrid';
import { ContentMediaPreviewModal } from '@/components/ContentMediaPreviewModal/ContentMediaPreviewModal';
import { AlbumDeleteReasonDialog } from '@/components/AlbumDeleteReasonDialog/AlbumDeleteReasonDialog';
import { ModerationStatusChips } from '@/components/ModerationStatusChips';
import { Button } from '@/components/radix/Button';
import { useAuth } from '@/contexts/AuthContext';
import { isPendingModeration } from '@/utils/contentModeration';
import { isSuperAdminFromToken } from '@/utils/platformAccess';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { buildLocalizedUserChatPath } from '@/utils/userChatPaths';
import type { ContentMediaItem } from '@/types/contentMedia';
import { formatDate, formatValue, mutationErrorMessage } from '@/utils/operatorDetailFormat';
import '@/styles/operatorDetailPage.scss';

type DialogMode = 'deleteAlbum' | 'deleteMedia' | 'reject' | null;

export function AlbumDetailPage() {
	const { id } = useParams<{ id: string }>();
	const [search] = useSearchParams();
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const albumId = id ? parseInt(id, 10) : 0;
	const faceId = parseInt(search.get('faceId') ?? '0', 10);
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const isSuperAdmin = isSuperAdminFromToken(token);

	const { data, isLoading, isError, error, refetch } = useAlbum(albumId, faceId);
	const deleteAlbum = useDeleteAlbum();
	const deleteMedia = useDeleteAlbumMedia();
	const moderation = useAlbumModerationAction();

	const [previewIndex, setPreviewIndex] = useState<number | null>(null);
	const [dialogMode, setDialogMode] = useState<DialogMode>(null);
	const [pendingMediaId, setPendingMediaId] = useState<number | null>(null);

	const canModerate = isPendingModeration(data?.approvalStatus);

	const mediaItems: ContentMediaItem[] = useMemo(
		() =>
			(data?.mediaItems ?? []).map((m) => ({
				...m,
				mediaType: m.mediaType === 'Video' ? 'Video' : 'Image',
			})),
		[data?.mediaItems]
	);

	const mediaCount = data?.mediaCount ?? data?.mediaItems?.length ?? 0;

	const closeDialog = () => {
		setDialogMode(null);
		setPendingMediaId(null);
	};

	const runDeletePayload = async (reason: string, userMessage: string) => {
		const payload = { faceId, reason, userMessage };
		if (dialogMode === 'deleteAlbum') {
			await deleteAlbum.mutateAsync({ albumId, payload });
			toast.success(t('pages.albumDetail.successDeleteAlbum'));
			navigate(getLocalizedPath(`/faces/${faceId}`));
			return;
		}
		if (dialogMode === 'deleteMedia' && pendingMediaId != null) {
			await deleteMedia.mutateAsync({ albumId, mediaId: pendingMediaId, payload });
			toast.success(t('pages.albumDetail.successDeleteMedia'));
			await refetch();
			setPreviewIndex(null);
			return;
		}
		if (dialogMode === 'reject') {
			await moderation.mutateAsync({
				albumId,
				faceId,
				action: 'reject',
				decision: { reason, userMessage },
			});
			toast.success(t('pages.albumDetail.successReject'));
			await refetch();
		}
	};

	const handleApprove = async () => {
		try {
			await moderation.mutateAsync({
				albumId,
				faceId,
				action: 'approve',
				decision: { reason: 'Approved from album detail' },
			});
			toast.success(t('pages.albumDetail.successApprove'));
			await refetch();
		} catch (e) {
			toast.error(mutationErrorMessage(e));
		}
	};

	const dialogTitle = () => {
		switch (dialogMode) {
			case 'deleteAlbum':
				return t('pages.albumDetail.deleteAlbum');
			case 'deleteMedia':
				return t('pages.albumDetail.deleteMedia');
			case 'reject':
				return t('pages.albumDetail.reject');
			default:
				return '';
		}
	};

	const backPath = getLocalizedPath(`/faces/${faceId}`);

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
						<h2>{t('pages.albumDetail.title')}</h2>
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
						<h1>{t('pages.albumDetail.title')}</h1>
					</div>

					<div className="user-detail-card" data-testid="album-detail-overview">
						<Row>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.albumsTable.colTitle')}</label>
									<p>{data.title}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.albumDetail.albumId')}</label>
									<p>{data.id}</p>
								</div>
							</Col>
							<Col xs={12}>
								<div className="user-detail-field">
									<label>{t('pages.albumDetail.description')}</label>
									<p>{formatValue(data.description)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.albumDetail.createdAt')}</label>
									<p>{formatDate(data.createdAt)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.albumsTable.mediaCount')}</label>
									<p>{mediaCount}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.albumDetail.approvalStatus')}</label>
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
									<label>{t('pages.albumDetail.aiReviewStatus')}</label>
									<p>{formatValue(data.aiReviewStatus)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.albumDetail.creatorStatusLabel')}</label>
									<p>{formatValue(data.creatorStatusLabel)}</p>
								</div>
							</Col>
							{data.creatorId && (
								<Col xs={12} md={6}>
									<div className="user-detail-field">
										<label>{t('pages.albumsTable.colCreator')}</label>
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
						</Row>
					</div>

					{isSuperAdmin && (
						<div className="user-detail-card">
							<h2 className="user-detail-section-title">
								{t('pages.albumDetail.moderationSection')}
							</h2>
							<div className="user-detail-action-buttons">
								{data.creatorId && (
									<Button
										variant="outline"
										onClick={() =>
											navigate(buildLocalizedUserChatPath(getLocalizedPath, data.creatorId!))
										}
									>
										{t('pages.albumDetail.openChat')}
									</Button>
								)}
								<Button
									variant="outline"
									onClick={() =>
										navigate(
											getLocalizedPath(
												`/content-moderation?contentType=Album&faceId=${faceId}&contentId=${albumId}`
											)
										)
									}
								>
									{t('pages.albumDetail.openInQueue')}
								</Button>
								{canModerate && (
									<>
										<Button
											variant="outline"
											onClick={() => void handleApprove()}
											disabled={moderation.isPending}
										>
											{t('pages.albumDetail.approve')}
										</Button>
										<Button
											variant="outline"
											onClick={() => setDialogMode('reject')}
											disabled={moderation.isPending}
										>
											{t('pages.albumDetail.reject')}
										</Button>
									</>
								)}
								<Button
									variant="danger"
									onClick={() => setDialogMode('deleteAlbum')}
									disabled={deleteAlbum.isPending}
								>
									{t('pages.albumDetail.deleteAlbum')}
								</Button>
							</div>
						</div>
					)}

					<div className="user-detail-card">
						<h2 className="user-detail-section-title">{t('pages.albumDetail.mediaSection')}</h2>
						<ContentMediaGrid
							items={mediaItems}
							showDelete={isSuperAdmin}
							onOpenPreview={(index) => setPreviewIndex(index)}
							onDeleteItem={(mediaId) => {
								setPendingMediaId(mediaId);
								setDialogMode('deleteMedia');
							}}
						/>
					</div>

					<div className="user-detail-card">
						<h2 className="user-detail-section-title">{t('pages.albumDetail.messagesSection')}</h2>
						<Row>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.albumDetail.aiReviewUserMessage')}</label>
									<p>{formatValue(data.aiReviewUserMessage)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.albumDetail.humanDecisionReason')}</label>
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
						setPendingMediaId(current.id);
						setDialogMode('deleteMedia');
						setPreviewIndex(null);
					}
				}}
			/>
			<AlbumDeleteReasonDialog
				key={dialogMode ?? 'closed'}
				show={dialogMode !== null}
				title={dialogTitle()}
				onCancel={closeDialog}
				isSubmitting={deleteAlbum.isPending || deleteMedia.isPending || moderation.isPending}
				onConfirm={async (reason, userMessage) => {
					try {
						await runDeletePayload(reason, userMessage);
						closeDialog();
					} catch (e) {
						toast.error(mutationErrorMessage(e));
					}
				}}
			/>
		</div>
	);
}
