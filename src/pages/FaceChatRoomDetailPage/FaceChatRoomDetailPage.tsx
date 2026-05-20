import { useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
	useFaceChatRoom,
	useFaceChatRoomJoinRequests,
	useDeleteFaceChatRoom,
} from '@/hooks/api/useFaceChatRoomsApi';
import {
	CHAT_ROOM_DETAIL_TEST_IDS,
	shouldShowJoinRequestsCard,
	shouldShowManagementCard,
} from '@/utils/faceChatRoomDetailUi';
import { ModerationPlainTextPreview } from '@/components/moderation/ModerationPlainTextPreview';
import { AlbumDeleteReasonDialog } from '@/components/AlbumDeleteReasonDialog/AlbumDeleteReasonDialog';
import { Button } from '@/components/radix/Button';
import { useAuth } from '@/contexts/AuthContext';
import { isSuperAdminFromToken } from '@/utils/contentModeration';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { buildLocalizedUserChatPath } from '@/utils/userChatPaths';
import { FaceChatRoomDetailMessagesTable } from './FaceChatRoomDetailMessagesTable';
import { FaceChatRoomDetailMembersTable } from './FaceChatRoomDetailMembersTable';
import '../UserDetailPage/UserDetailPage.scss';

type DialogMode = 'deleteChatRoom' | null;

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

export function FaceChatRoomDetailPage() {
	const { faceId: faceIdParam, roomId: roomIdParam } = useParams<{
		faceId: string;
		roomId: string;
	}>();
	const [search] = useSearchParams();
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const faceId = parseInt(faceIdParam ?? search.get('faceId') ?? '0', 10);
	const roomId = roomIdParam ? parseInt(roomIdParam, 10) : 0;
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const isSuperAdmin = isSuperAdminFromToken(token);

	const { data, isLoading, isError, error } = useFaceChatRoom(faceId, roomId);
	const showJoinRequests =
		data != null && shouldShowJoinRequestsCard(data.isPublic, data.pendingJoinRequestCount);
	const { data: joinRequestsData, isLoading: joinRequestsLoading } = useFaceChatRoomJoinRequests(
		faceId,
		roomId,
		showJoinRequests
	);
	const deleteRoom = useDeleteFaceChatRoom();

	const [dialogMode, setDialogMode] = useState<DialogMode>(null);

	const backPath = getLocalizedPath(`/faces/${faceId}`);

	const closeDialog = () => setDialogMode(null);

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
						<h1>{t('pages.chatRoomDetail.title')}</h1>
					</div>

					<div className="user-detail-card" data-testid={CHAT_ROOM_DETAIL_TEST_IDS.overview}>
						<Row>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.chatRoomDetail.roomTitle')}</label>
									<p>{data.title}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.chatRoomDetail.roomId')}</label>
									<p>{data.id}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.chatRoomDetail.visibility')}</label>
									<p>
										<span
											className={`badge ${data.isPublic ? 'text-bg-primary' : 'text-bg-secondary'}`}
										>
											{data.isPublic
												? t('pages.chatRoomsTable.public')
												: t('pages.chatRoomsTable.private')}
										</span>
										{data.isSystemManaged && (
											<span className="badge text-bg-info ms-2">
												{t('pages.chatRoomsTable.system')}
											</span>
										)}
									</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.chatRoomDetail.faceLabel')}</label>
									<p>
										<Link to={getLocalizedPath(`/faces/${faceId}`)}>{faceId}</Link>
									</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.chatRoomDetail.creatorLabel')}</label>
									<p>
										{data.creatorUserId ? (
											<Link to={getLocalizedPath(`/users/${data.creatorUserId}`)}>
												{data.creatorUserId}
											</Link>
										) : (
											'—'
										)}
									</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.chatRoomDetail.memberCount')}</label>
									<p>{formatValue(data.memberCount)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.chatRoomDetail.messageCount')}</label>
									<p>{formatValue(data.messageCount)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.chatRoomDetail.pendingJoinRequests')}</label>
									<p>{formatValue(data.pendingJoinRequestCount)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.chatRoomDetail.createdAt')}</label>
									<p>{formatDate(data.createdAt)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.chatRoomDetail.updatedAt')}</label>
									<p>{formatDate(data.updatedAt)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.chatRoomDetail.lastMessageAt')}</label>
									<p>{formatDate(data.lastMessageAt)}</p>
								</div>
							</Col>
						</Row>
					</div>

					<div className="user-detail-card" data-testid={CHAT_ROOM_DETAIL_TEST_IDS.description}>
						<h2 className="user-detail-section-title">
							{t('pages.chatRoomDetail.descriptionSection')}
						</h2>
						{data.description?.trim() ? (
							<ModerationPlainTextPreview text={data.description} />
						) : (
							<p className="text-muted">{t('pages.chatRoomDetail.descriptionEmpty')}</p>
						)}
					</div>

					<FaceChatRoomDetailMessagesTable faceId={faceId} roomId={roomId} />
					<FaceChatRoomDetailMembersTable faceId={faceId} roomId={roomId} />

					{shouldShowManagementCard(isSuperAdmin) && (
						<div className="user-detail-card">
							<h2 className="user-detail-section-title">
								{t('pages.chatRoomDetail.managementSection')}
							</h2>
							<div className="user-detail-action-buttons">
								<Button
									variant="outline"
									disabled={!data.creatorUserId}
									title={
										data.creatorUserId ? undefined : t('pages.chatRoomDetail.systemRoomNoCreator')
									}
									onClick={() => {
										if (data.creatorUserId) {
											navigate(buildLocalizedUserChatPath(getLocalizedPath, data.creatorUserId));
										}
									}}
								>
									{t('pages.chatRoomDetail.openChat')}
								</Button>
								<Button
									variant="danger"
									onClick={() => setDialogMode('deleteChatRoom')}
									disabled={deleteRoom.isPending}
								>
									{t('pages.chatRoomDetail.deleteRoom')}
								</Button>
							</div>
						</div>
					)}

					{showJoinRequests && (
						<div className="user-detail-card" data-testid={CHAT_ROOM_DETAIL_TEST_IDS.joinRequests}>
							<h2 className="user-detail-section-title">
								{t('pages.chatRoomDetail.joinRequestsSection')}
							</h2>
							{joinRequestsLoading ? (
								<p className="text-muted">{t('common.loading')}</p>
							) : (joinRequestsData?.items.length ?? 0) === 0 ? (
								<p className="text-muted">{t('pages.chatRoomDetail.joinRequestsEmpty')}</p>
							) : (
								<div className="d-flex flex-column gap-2">
									{joinRequestsData?.items.map((r) => (
										<div key={r.requestId} className="border rounded p-2 d-flex flex-wrap gap-3">
											<div>
												<div className="small text-muted">
													{t('pages.chatRoomDetail.colMember')}
												</div>
												<Link to={getLocalizedPath(`/users/${r.userId}`)}>
													{r.displayName || r.userId}
												</Link>
											</div>
											<div>
												<div className="small text-muted">
													{t('pages.chatRoomDetail.colJoinRequestedAt')}
												</div>
												{formatDate(r.createdAt)}
											</div>
											<div>
												<div className="small text-muted">
													{t('pages.chatRoomDetail.colRequestId')}
												</div>
												{r.requestId}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			</Container>

			<AlbumDeleteReasonDialog
				key={dialogMode ?? 'closed'}
				show={dialogMode !== null}
				title={t('pages.chatRoomDetail.deleteDialogTitle')}
				onCancel={closeDialog}
				isSubmitting={deleteRoom.isPending}
				onConfirm={async (reason, userMessage) => {
					try {
						await deleteRoom.mutateAsync({
							roomId,
							payload: { faceId, reason, userMessage },
						});
						toast.success(t('pages.chatRoomDetail.successDeleteRoom'));
						closeDialog();
						navigate(backPath);
					} catch (e) {
						toast.error(mutationErrorMessage(e));
					}
				}}
			/>
		</div>
	);
}
