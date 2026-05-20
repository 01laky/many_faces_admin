import { useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
	faceProfilesKeys,
	useDeleteFaceProfileComment,
	useDeleteFaceProfileReview,
	useFaceProfile,
} from '@/hooks/api/useFaceProfilesApi';
import { useOperatorUserMutations } from '@/hooks/api/useOperatorUsersApi';
import { AlbumDeleteReasonDialog } from '@/components/AlbumDeleteReasonDialog/AlbumDeleteReasonDialog';
import { Button } from '@/components/radix/Button';
import { useAuth } from '@/contexts/AuthContext';
import { isSuperAdminFromToken } from '@/utils/contentModeration';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { buildLocalizedUserChatPath } from '@/utils/userChatPaths';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import {
	PROFILE_DETAIL_TEST_IDS,
	shouldShowManagementCard,
	shouldShowReviewsCard,
	type ProfileDetailDialogMode,
} from '@/utils/faceProfileDetailUi';
import { FaceProfileDetailCommentsTable } from './FaceProfileDetailCommentsTable';
import { FaceProfileDetailReviewsTable } from './FaceProfileDetailReviewsTable';
import '../UserDetailPage/UserDetailPage.scss';

function mutationErrorMessage(error: unknown): string {
	if (error instanceof Error && error.message) return error.message;
	return 'Request failed';
}

function formatValue(value: string | number | boolean | null | undefined): string {
	if (value === null || value === undefined || value === '') return '—';
	return String(value);
}

function formatDate(value: string | null | undefined): string {
	if (!value) return '—';
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

export function FaceProfileDetailPage() {
	const { faceId: faceIdParam, userId: userIdParam } = useParams<{
		faceId: string;
		userId: string;
	}>();
	const [search] = useSearchParams();
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const faceId = parseInt(faceIdParam ?? search.get('faceId') ?? '0', 10);
	const userId = userIdParam ?? '';
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const isSuperAdmin = isSuperAdminFromToken(token);
	const queryClient = useQueryClient();
	const { confirm, ConfirmModalHost } = useConfirmModal();

	const { data, isLoading, isError, error } = useFaceProfile(faceId, userId);
	const deleteComment = useDeleteFaceProfileComment(faceId, userId);
	const deleteReview = useDeleteFaceProfileReview(faceId, userId);
	const { faceBan, faceUnban } = useOperatorUserMutations(userId);

	const [dialogMode, setDialogMode] = useState<ProfileDetailDialogMode | null>(null);
	const [pendingEntityId, setPendingEntityId] = useState<number | null>(null);

	const backPath = getLocalizedPath(`/faces/${faceId}`);
	const showReviews = data != null && shouldShowReviewsCard(data.faceAllowsRecensions === true);
	const showManagement = shouldShowManagementCard(isSuperAdmin);

	const invalidateDetail = () =>
		void queryClient.invalidateQueries({ queryKey: faceProfilesKeys.detail(faceId, userId) });

	const closeDialog = () => {
		setDialogMode(null);
		setPendingEntityId(null);
	};

	const dialogTitle =
		dialogMode === 'deleteComment'
			? t('pages.profileDetail.deleteCommentDialogTitle')
			: dialogMode === 'deleteReview'
				? t('pages.profileDetail.deleteReviewDialogTitle')
				: dialogMode === 'faceBan'
					? t('pages.userDetail.confirmFaceBanTitle')
					: '';

	const reasonDialogOpen =
		dialogMode === 'faceBan' ||
		((dialogMode === 'deleteComment' || dialogMode === 'deleteReview') && pendingEntityId != null);

	const handleFaceUnban = async () => {
		const ok = await confirm({
			title: t('pages.userDetail.confirmFaceUnbanTitle'),
			message: t('pages.userDetail.confirmFaceUnbanMessage'),
			confirmLabel: t('pages.userDetail.faceUnban'),
			confirmVariant: 'danger',
		});
		if (!ok) return;
		try {
			await faceUnban.mutateAsync(faceId);
			toast.success(t('pages.userDetail.successFaceUnban'));
			invalidateDetail();
		} catch (e) {
			toast.error(mutationErrorMessage(e));
		}
	};

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
						<p>{t('common.notFound')}</p>
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
						<h1>{t('pages.profileDetail.title')}</h1>
					</div>

					<div className="user-detail-card" data-testid={PROFILE_DETAIL_TEST_IDS.overview}>
						<Row>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.displayName')}</label>
									<p>{formatValue(data.displayName)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.userId')}</label>
									<p className="font-monospace small">{data.userId}</p>
								</div>
							</Col>
							{data.avatarUrl && (
								<Col xs={12} md={3}>
									<div className="user-detail-field">
										<label>{t('pages.profileDetail.avatarThumb')}</label>
										<p>
											<img
												src={data.avatarUrl}
												alt=""
												width={48}
												height={48}
												style={{ objectFit: 'cover', borderRadius: 4 }}
											/>
										</p>
									</div>
								</Col>
							)}
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.nickname')}</label>
									<p>{formatValue(data.nickname)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.age')}</label>
									<p>{formatValue(data.age)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.rod')}</label>
									<p>{formatValue(data.rod)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.faceLink')}</label>
									<p>
										<Link to={getLocalizedPath(`/faces/${faceId}`)}>{faceId}</Link>
									</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.faceVisibility')}</label>
									<p>
										<span className="badge text-bg-secondary">
											{formatValue(data.faceVisibility)}
										</span>
									</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.faceRoleName')}</label>
									<p>{formatValue(data.faceRoleName)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.isActive')}</label>
									<p>{formatValue(data.isActive)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.visited')}</label>
									<p>{formatValue(data.visited)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.isFaceBanned')}</label>
									<p>
										{data.isFaceBanned ? (
											<span className="badge text-bg-danger">
												{t('pages.profileDetail.faceBannedBadge')}
											</span>
										) : (
											formatValue(false)
										)}
									</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.commentsCount')}</label>
									<p>{formatValue(data.commentsCount)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.likesCount')}</label>
									<p>{formatValue(data.likesCount)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.reviewsCount')}</label>
									<p>{formatValue(data.reviewsCount)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.faceAllowsRecensions')}</label>
									<p>{formatValue(data.faceAllowsRecensions)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.createdAt')}</label>
									<p>{formatDate(data.createdAt)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.updatedAt')}</label>
									<p>{formatDate(data.updatedAt)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.profileDetail.openUser')}</label>
									<p>
										<Link to={getLocalizedPath(`/users/${data.userId}`)}>{data.userId}</Link>
									</p>
								</div>
							</Col>
						</Row>
					</div>

					<div className="user-detail-card" data-testid={PROFILE_DETAIL_TEST_IDS.avatar}>
						<h2 className="user-detail-section-title">{t('pages.profileDetail.avatarSection')}</h2>
						{data.avatarUrl ? (
							<div className="text-center">
								<img src={data.avatarUrl} alt="" style={{ maxHeight: 320, objectFit: 'contain' }} />
							</div>
						) : (
							<p className="text-muted">{t('pages.profileDetail.avatarEmpty')}</p>
						)}
					</div>

					<FaceProfileDetailCommentsTable
						faceId={faceId}
						userId={userId}
						isSuperAdmin={isSuperAdmin}
						onDeleteComment={(id) => {
							setPendingEntityId(id);
							setDialogMode('deleteComment');
						}}
					/>

					{showReviews && (
						<FaceProfileDetailReviewsTable
							faceId={faceId}
							userId={userId}
							faceAllowsRecensions={data.faceAllowsRecensions === true}
							isSuperAdmin={isSuperAdmin}
							onDeleteReview={(id) => {
								setPendingEntityId(id);
								setDialogMode('deleteReview');
							}}
						/>
					)}

					{showManagement && (
						<div className="user-detail-card">
							<h2 className="user-detail-section-title">
								{t('pages.profileDetail.managementSection')}
							</h2>
							<div className="user-detail-action-buttons">
								<Button
									variant="outline"
									onClick={() => navigate(buildLocalizedUserChatPath(getLocalizedPath, userId))}
								>
									{t('pages.profileDetail.openChat')}
								</Button>
								<Button
									variant="outline"
									onClick={() => navigate(getLocalizedPath(`/users/${userId}`))}
								>
									{t('pages.profileDetail.openUser')}
								</Button>
								{data.isFaceBanned ? (
									<Button
										variant="outline"
										disabled={faceUnban.isPending}
										onClick={() => void handleFaceUnban()}
									>
										{t('pages.userDetail.faceUnban')}
									</Button>
								) : (
									<Button
										variant="danger"
										disabled={faceBan.isPending}
										onClick={() => setDialogMode('faceBan')}
									>
										{t('pages.userDetail.faceBan')}
									</Button>
								)}
							</div>
						</div>
					)}
				</div>
			</Container>

			<AlbumDeleteReasonDialog
				key={dialogMode ?? 'closed'}
				show={reasonDialogOpen}
				title={dialogTitle}
				onCancel={closeDialog}
				requireUserMessage={dialogMode !== 'faceBan'}
				isSubmitting={deleteComment.isPending || deleteReview.isPending || faceBan.isPending}
				onConfirm={async (reason, userMessage) => {
					try {
						if (dialogMode === 'faceBan') {
							await faceBan.mutateAsync({ faceId, reason });
							toast.success(t('pages.userDetail.successFaceBan'));
							invalidateDetail();
						} else {
							const payload = { faceId, reason, userMessage };
							if (dialogMode === 'deleteComment' && pendingEntityId != null) {
								await deleteComment.mutateAsync({
									commentId: pendingEntityId,
									payload,
								});
								toast.success(t('pages.profileDetail.successDeleteComment'));
							} else if (dialogMode === 'deleteReview' && pendingEntityId != null) {
								await deleteReview.mutateAsync({
									reviewId: pendingEntityId,
									payload,
								});
								toast.success(t('pages.profileDetail.successDeleteReview'));
							}
						}
						closeDialog();
					} catch (e) {
						toast.error(mutationErrorMessage(e));
					}
				}}
			/>
			{ConfirmModalHost}
		</div>
	);
}
