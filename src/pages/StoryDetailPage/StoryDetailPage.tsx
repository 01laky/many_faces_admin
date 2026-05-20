import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHeaderCell,
	TableCell,
} from '@/components/radix/Table';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useStory, useDeleteStory, useDeleteStoryImage } from '@/hooks/api/useStoriesApi';
import { ContentMediaGrid } from '@/components/ContentMediaGrid/ContentMediaGrid';
import { ContentMediaPreviewModal } from '@/components/ContentMediaPreviewModal/ContentMediaPreviewModal';
import { AlbumDeleteReasonDialog } from '@/components/AlbumDeleteReasonDialog/AlbumDeleteReasonDialog';
import { Button } from '@/components/radix/Button';
import { useAuth } from '@/contexts/AuthContext';
import { isSuperAdminFromToken } from '@/utils/contentModeration';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { buildLocalizedUserChatPath } from '@/utils/userChatPaths';
import { storyImagesToMediaItems } from '@/utils/storyDetailMedia';
import { isStoryLive, mapStoryDetailError, storyStateLabelKey } from '@/utils/storyDetailUi';
import '../UserDetailPage/UserDetailPage.scss';

type DialogMode = 'deleteStory' | 'deleteImage' | null;

function formatValue(value: string | number | null | undefined): string {
	if (value === null || value === undefined || value === '') return '—';
	return String(value);
}

function formatDate(value: string | null | undefined): string {
	if (!value) return '—';
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

export function StoryDetailPage() {
	const { id } = useParams<{ id: string }>();
	const [search] = useSearchParams();
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const storyId = id ? parseInt(id, 10) : 0;
	const faceId = parseInt(search.get('faceId') ?? '0', 10);
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const isSuperAdmin = isSuperAdminFromToken(token);

	const { data, isLoading, isError, error, refetch } = useStory(storyId, faceId);
	const deleteStory = useDeleteStory();
	const deleteImage = useDeleteStoryImage();

	const [previewIndex, setPreviewIndex] = useState<number | null>(null);
	const [dialogMode, setDialogMode] = useState<DialogMode>(null);
	const [pendingImageId, setPendingImageId] = useState<number | null>(null);

	const backPath = getLocalizedPath(`/faces/${faceId}`);
	const mediaItems = useMemo(
		() => (data ? storyImagesToMediaItems(data.id, data.title, data.images ?? []) : []),
		[data]
	);
	const live = data ? isStoryLive(data.state, data.publishedAt, data.expiresAt) : false;

	const closeDialog = () => {
		setDialogMode(null);
		setPendingImageId(null);
	};

	const runDialogPayload = async (reason: string, userMessage: string) => {
		const payload = { faceId, reason, userMessage };
		if (dialogMode === 'deleteStory') {
			await deleteStory.mutateAsync({ storyId, payload });
			toast.success(t('pages.storyDetail.successDeleteStory'));
			navigate(backPath);
			return;
		}
		if (dialogMode === 'deleteImage' && pendingImageId != null) {
			try {
				await deleteImage.mutateAsync({ storyId, imageId: pendingImageId, payload });
				toast.success(t('pages.storyDetail.successDeleteImage'));
				await refetch();
				setPreviewIndex(null);
			} catch (e) {
				const key = mapStoryDetailError(e);
				toast.error(key ? t(key) : e instanceof Error ? e.message : t('common.error'));
			}
		}
	};

	const dialogTitle = () => {
		if (dialogMode === 'deleteStory') return t('pages.storyDetail.deleteStory');
		if (dialogMode === 'deleteImage') return t('pages.storyDetail.deleteImage');
		return '';
	};

	if (faceId <= 0) {
		return (
			<div className="user-detail-page-wrapper" style={{ padding: '2rem' }}>
				<Container fluid>
					<div className="user-detail-error">
						<p>{t('pages.storyDetail.missingFaceId')}</p>
					</div>
				</Container>
			</div>
		);
	}

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
						<p>{error instanceof Error ? error.message : t('pages.storyDetail.loadError')}</p>
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
						<h2>{t('pages.storyDetail.title')}</h2>
						<p>{t('pages.storyDetail.notFound')}</p>
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
						<h1>{t('pages.storyDetail.title')}</h1>
					</div>

					<div className="user-detail-card" data-testid="story-detail-overview">
						<Row>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.storiesTable.colTitle')}</label>
									<p>{data.title}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.storyDetail.storyId')}</label>
									<p>{data.id}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.storyDetail.state')}</label>
									<p>
										<span className="badge text-bg-secondary me-2">
											{t(storyStateLabelKey(data.state))}
										</span>
										<span className={`badge ${live ? 'text-bg-success' : 'text-bg-secondary'}`}>
											{live ? t('pages.storyDetail.liveYes') : t('pages.storyDetail.liveNo')}
										</span>
									</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.storyDetail.createdAt')}</label>
									<p>{formatDate(data.createdAt)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.storyDetail.updatedAt')}</label>
									<p>{formatDate(data.updatedAt)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.storyDetail.publishedAt')}</label>
									<p>{formatDate(data.publishedAt)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.storyDetail.expiresAt')}</label>
									<p>{formatDate(data.expiresAt)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.storyDetail.scheduledPublishAt')}</label>
									<p>{formatDate(data.scheduledPublishAt)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.storyDetail.creatorLabel')}</label>
									<p>
										{data.creatorId ? (
											<Link
												to={getLocalizedPath(`/users/${data.creatorId}`)}
												className="link-primary"
											>
												{data.creatorName || data.creatorId}
											</Link>
										) : (
											'—'
										)}
									</p>
								</div>
							</Col>
							<Col xs={12}>
								<div className="user-detail-field">
									<label>{t('pages.storyDetail.facesLabel')}</label>
									<p>
										{data.faces && data.faces.length > 0
											? data.faces.map((f, idx) => (
													<span key={f.faceId}>
														{idx > 0 ? ', ' : ''}
														<Link
															to={getLocalizedPath(`/faces/${f.faceId}`)}
															className="link-primary"
														>
															{f.title || f.faceId}
														</Link>
													</span>
												))
											: t('pages.storyDetail.facesUntargeted')}
									</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.storyDetail.likesCount')}</label>
									<p>{formatValue(data.likesCount)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.storyDetail.commentsCount')}</label>
									<p>{formatValue(data.commentsCount)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.storyDetail.viewCount')}</label>
									<p>{formatValue(data.viewCount)}</p>
								</div>
							</Col>
						</Row>
					</div>

					<div className="user-detail-card" data-testid="story-detail-images">
						<h2 className="user-detail-section-title">{t('pages.storyDetail.imagesSection')}</h2>
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
							<p className="text-muted">{t('pages.storyDetail.imagesEmpty')}</p>
						)}
					</div>

					{data.viewers && data.viewers.length > 0 && (
						<div className="user-detail-card" data-testid="story-detail-viewers">
							<h2 className="user-detail-section-title">{t('pages.storyDetail.viewersSection')}</h2>
							<Table variant="striped" size="2">
								<TableHeader>
									<TableRow>
										<TableHeaderCell>{t('pages.storyDetail.viewerName')}</TableHeaderCell>
										<TableHeaderCell>{t('pages.storyDetail.viewedAt')}</TableHeaderCell>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data.viewers.map((v) => (
										<TableRow key={`${v.viewerUserId}-${v.viewedAt}`}>
											<TableCell>
												<Link
													to={getLocalizedPath(`/users/${v.viewerUserId}`)}
													className="link-primary"
													onClick={(e) => e.stopPropagation()}
												>
													{v.viewerName || v.viewerUserId}
												</Link>
											</TableCell>
											<TableCell>{formatDate(v.viewedAt)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}

					{isSuperAdmin && (
						<div className="user-detail-card">
							<h2 className="user-detail-section-title">
								{t('pages.storyDetail.managementSection')}
							</h2>
							<div className="user-detail-action-buttons">
								{data.creatorId && (
									<Button
										variant="outline"
										onClick={() =>
											navigate(buildLocalizedUserChatPath(getLocalizedPath, data.creatorId!))
										}
									>
										{t('pages.storyDetail.openChat')}
									</Button>
								)}
								<Button variant="danger" onClick={() => setDialogMode('deleteStory')}>
									{t('pages.storyDetail.deleteStory')}
								</Button>
							</div>
						</div>
					)}
				</div>
			</Container>

			<AlbumDeleteReasonDialog
				show={dialogMode != null}
				title={dialogTitle()}
				onCancel={closeDialog}
				onConfirm={runDialogPayload}
				isSubmitting={deleteStory.isPending || deleteImage.isPending}
				requireUserMessage
			/>

			<ContentMediaPreviewModal
				open={previewIndex != null}
				items={mediaItems}
				initialIndex={previewIndex ?? 0}
				onClose={() => setPreviewIndex(null)}
				showDelete={false}
			/>
		</div>
	);
}
