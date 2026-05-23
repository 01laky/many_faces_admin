import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
	useOperatorUserDetail,
	useFaceRoles,
	useOperatorUserMutations,
} from '@/hooks/api/useOperatorUsersApi';
import { useOperatorUserChatThreadExists } from '@/hooks/api/useOperatorUserChatApi';
import { isSuperAdminFromToken } from '@/utils/platformAccess';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/radix/Button';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { buildLocalizedUserChatPath } from '@/utils/userChatPaths';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { canSubmitFaceBan, canSubmitGlobalBan } from '@/utils/operatorUserDetailUi';
import { UserDetailFacesTable } from './UserDetailFacesTable';
import { UserDetailAlbumsTable } from './UserDetailAlbumsTable';
import { UserDetailBlogsTable } from './UserDetailBlogsTable';
import { UserDetailStoriesTable } from './UserDetailStoriesTable';
import { UserDetailReelsTable } from './UserDetailReelsTable';
import './UserDetailPage.scss';
import { mutationErrorMessage } from '@/utils/operatorDetailFormat';

export function UserDetailPage() {
	const { id } = useParams<{ id: string }>();
	const userId = id ?? '';
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const { confirm, ConfirmModalHost } = useConfirmModal();

	const { token } = useAuth();
	const { data: user, isLoading, error } = useOperatorUserDetail(userId);
	const { data: faceRoles = [] } = useFaceRoles();
	const { globalBan, globalUnban, faceBan, faceUnban, setFaceRole } =
		useOperatorUserMutations(userId);
	const { data: threadExists } = useOperatorUserChatThreadExists(
		userId,
		Boolean(userId) && isSuperAdminFromToken(token)
	);

	const [globalBanReason, setGlobalBanReason] = useState('');
	const [faceBanReasonById, setFaceBanReasonById] = useState<Record<number, string>>({});

	const handleGlobalBan = async () => {
		if (!canSubmitGlobalBan(globalBanReason)) {
			toast.error(t('pages.userDetail.banReasonInvalid'));
			return;
		}
		const ok = await confirm({
			title: t('pages.userDetail.confirmGlobalBanTitle'),
			message: t('pages.userDetail.confirmGlobalBanMessage'),
			confirmLabel: t('pages.userDetail.globalBan'),
			confirmVariant: 'danger',
		});
		if (!ok) return;
		try {
			await globalBan.mutateAsync(globalBanReason.trim());
			setGlobalBanReason('');
			toast.success(t('pages.userDetail.successGlobalBan'));
		} catch (e) {
			toast.error(mutationErrorMessage(e));
		}
	};

	const handleGlobalUnban = async () => {
		const ok = await confirm({
			title: t('pages.userDetail.confirmGlobalUnbanTitle'),
			message: t('pages.userDetail.confirmGlobalUnbanMessage'),
			confirmLabel: t('pages.userDetail.globalUnban'),
			confirmVariant: 'danger',
		});
		if (!ok) return;
		try {
			await globalUnban.mutateAsync();
			toast.success(t('pages.userDetail.successGlobalUnban'));
		} catch (e) {
			toast.error(mutationErrorMessage(e));
		}
	};

	const handleFaceBan = async (faceId: number) => {
		const reason = faceBanReasonById[faceId] ?? '';
		if (!canSubmitFaceBan(reason)) {
			toast.error(t('pages.userDetail.banReasonInvalid'));
			return;
		}
		const ok = await confirm({
			title: t('pages.userDetail.confirmFaceBanTitle'),
			message: t('pages.userDetail.confirmFaceBanMessage'),
			confirmLabel: t('pages.userDetail.faceBan'),
			confirmVariant: 'danger',
		});
		if (!ok) return;
		try {
			await faceBan.mutateAsync({ faceId, reason: reason.trim() });
			setFaceBanReasonById((prev) => {
				const next = { ...prev };
				delete next[faceId];
				return next;
			});
			toast.success(t('pages.userDetail.successFaceBan'));
		} catch (e) {
			toast.error(mutationErrorMessage(e));
		}
	};

	const handleFaceUnban = async (faceId: number) => {
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
		} catch (e) {
			toast.error(mutationErrorMessage(e));
		}
	};

	const handleRoleChange = async (faceId: number, userRoleId: number) => {
		try {
			await setFaceRole.mutateAsync({ faceId, userRoleId });
			toast.success(t('pages.userDetail.successRole'));
		} catch (e) {
			toast.error(mutationErrorMessage(e));
		}
	};

	if (isLoading) {
		return (
			<div className="user-detail-page-wrapper" style={{ padding: '2rem' }}>
				<Container fluid>
					<div className="user-detail-loading">
						<p>{t('pages.userDetail.loading')}</p>
					</div>
				</Container>
			</div>
		);
	}

	if (error) {
		return (
			<div className="user-detail-page-wrapper" style={{ padding: '2rem' }}>
				<Container fluid>
					<div className="user-detail-error">
						<p>{t('pages.userDetail.error')}</p>
						<Button onClick={() => navigate(getLocalizedPath('/users'))}>{t('common.back')}</Button>
					</div>
				</Container>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="user-detail-page-wrapper" style={{ padding: '2rem' }}>
				<Container fluid>
					<div className="user-detail-not-found">
						<h2>{t('pages.userDetail.notFound')}</h2>
						<Button onClick={() => navigate(getLocalizedPath('/users'))}>{t('common.back')}</Button>
					</div>
				</Container>
			</div>
		);
	}

	return (
		<div className="user-detail-page-wrapper" style={{ padding: '2rem' }}>
			{ConfirmModalHost}
			<Container fluid>
				<div className="user-detail-content">
					<div className="user-detail-header">
						<Button
							variant="outline"
							onClick={() => navigate(getLocalizedPath('/users'))}
							className="back-button"
						>
							← {t('common.back')}
						</Button>
						<h1>{t('pages.userDetail.title')}</h1>
					</div>

					<div className="user-detail-card">
						<Row>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.userDetail.id')}</label>
									<p>{user.id}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.userDetail.email')}</label>
									<p>{user.email ?? '—'}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.userDetail.firstName')}</label>
									<p>{user.firstName ?? '—'}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.userDetail.lastName')}</label>
									<p>{user.lastName ?? '—'}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.userDetail.createdAt')}</label>
									<p>{user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.userDetail.globalRole')}</label>
									<p>{user.globalRole.name}</p>
								</div>
							</Col>
						</Row>

						<div className="user-detail-badges">
							{user.badges.isGloballyBanned && (
								<span className="user-detail-badge user-detail-badge--danger">
									{t('pages.userDetail.badgeGlobalBan')}
								</span>
							)}
							{user.badges.activeFaceBanCount > 0 && (
								<span className="user-detail-badge user-detail-badge--warning">
									{t('pages.userDetail.badgeFaceBans', { count: user.badges.activeFaceBanCount })}
								</span>
							)}
							<span className="user-detail-badge">
								{user.badges.emailConfirmed
									? t('pages.userDetail.badgeEmailConfirmed')
									: t('pages.userDetail.badgeEmailUnconfirmed')}
							</span>
						</div>
					</div>

					<div className="user-detail-card">
						<h2 className="user-detail-section-title">{t('pages.userDetail.moderationTitle')}</h2>
						{user.badges.isGloballyBanned ? (
							<Button
								variant="outline"
								onClick={handleGlobalUnban}
								disabled={globalUnban.isPending}
							>
								{t('pages.userDetail.globalUnban')}
							</Button>
						) : (
							<div className="user-detail-moderation-block">
								<label htmlFor="global-ban-reason">{t('pages.userDetail.banReason')}</label>
								<textarea
									id="global-ban-reason"
									className="user-detail-textarea"
									value={globalBanReason}
									onChange={(e) => setGlobalBanReason(e.target.value)}
									placeholder={t('pages.userDetail.banReasonHint')}
									rows={3}
								/>
								<Button
									variant="outline"
									onClick={handleGlobalBan}
									disabled={globalBan.isPending || !canSubmitGlobalBan(globalBanReason)}
								>
									{t('pages.userDetail.globalBan')}
								</Button>
							</div>
						)}
					</div>

					<div className="user-detail-card">
						<h2 className="user-detail-section-title">{t('pages.userDetail.facesTitle')}</h2>
						<UserDetailFacesTable
							faces={user.faces}
							faceRoles={faceRoles}
							faceBanReasonById={faceBanReasonById}
							setFaceBanReasonById={setFaceBanReasonById}
							onRoleChange={handleRoleChange}
							onFaceBan={handleFaceBan}
							onFaceUnban={handleFaceUnban}
							roleChangePending={setFaceRole.isPending}
							faceBanPending={faceBan.isPending}
							faceUnbanPending={faceUnban.isPending}
						/>
					</div>

					<div className="user-detail-card">
						<UserDetailAlbumsTable
							creatorId={userId}
							userFaceIds={user.faces.map((f) => f.faceId)}
						/>
					</div>

					<div className="user-detail-card">
						<UserDetailBlogsTable creatorId={userId} />
					</div>

					<div className="user-detail-card">
						<UserDetailStoriesTable
							creatorId={userId}
							userFaceIds={user.faces.map((f) => f.faceId)}
						/>
					</div>

					<div className="user-detail-card">
						<UserDetailReelsTable
							creatorId={userId}
							userFaceIds={user.faces.map((f) => f.faceId)}
						/>
					</div>

					{isSuperAdminFromToken(token) && (
						<div className="user-detail-card">
							<h2 className="user-detail-section-title">
								{t('pages.userDetail.platformMessageTitle')}
							</h2>
							<p className="user-detail-hint">{t('pages.userDetail.platformMessageHint')}</p>
							<Button
								onClick={() => navigate(buildLocalizedUserChatPath(getLocalizedPath, userId))}
							>
								{threadExists?.hasThread
									? t('pages.userDetail.openChat')
									: t('pages.userDetail.startChat')}
							</Button>
						</div>
					)}
				</div>
			</Container>
		</div>
	);
}
