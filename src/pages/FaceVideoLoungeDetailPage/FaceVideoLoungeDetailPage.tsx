import { useMemo } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
	useFaceVideoLounge,
	useFaceVideoLoungeLive,
	useOperatorVideoLoungeStealthJoin,
	useOperatorVideoLoungeKick,
	useOperatorVideoLoungeKickAll,
} from '@/hooks/api/useFaceVideoLoungesApi';
import {
	VIDEO_LOUNGE_DETAIL_TEST_IDS,
	shouldShowOperatorManagementCard,
} from '@/utils/faceVideoLoungeDetailUi';
import { ModerationPlainTextPreview } from '@/components/moderation/ModerationPlainTextPreview';
import { Button } from '@/components/radix/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useMeCapabilities } from '@/hooks/api/useMeCapabilities';
import { canManageAllFaces } from '@/acl/permissions';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import '../UserDetailPage/UserDetailPage.scss';

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

export function FaceVideoLoungeDetailPage() {
	const { faceId: faceIdParam, loungeId: loungeIdParam } = useParams<{
		faceId: string;
		loungeId: string;
	}>();
	const [search] = useSearchParams();
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const faceId = parseInt(faceIdParam ?? search.get('faceId') ?? '0', 10);
	const loungeId = loungeIdParam ? parseInt(loungeIdParam, 10) : 0;
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const { data: caps } = useMeCapabilities(token, Boolean(token));
	const isOperator = useMemo(() => canManageAllFaces(caps), [caps]);

	const { data, isLoading, isError, error } = useFaceVideoLounge(faceId, loungeId);
	const showOperatorCard = shouldShowOperatorManagementCard(isOperator);
	const { data: liveData, isLoading: liveLoading } = useFaceVideoLoungeLive(
		faceId,
		loungeId,
		showOperatorCard && Boolean(data?.hasLiveSession)
	);

	const stealthJoin = useOperatorVideoLoungeStealthJoin();
	const kickOne = useOperatorVideoLoungeKick();
	const kickAll = useOperatorVideoLoungeKickAll();

	const backPath = getLocalizedPath(`/faces/${faceId}`);
	const operatorParticipants = liveData?.operatorLiveParticipants ?? [];

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
						<h1>{t('pages.videoLoungeDetail.title')}</h1>
					</div>

					<div className="user-detail-card" data-testid={VIDEO_LOUNGE_DETAIL_TEST_IDS.overview}>
						<Row>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.videoLoungeDetail.loungeTitle')}</label>
									<p>{data.title}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.videoLoungeDetail.loungeId')}</label>
									<p>{data.id}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.videoLoungeDetail.visibility')}</label>
									<p>
										<span
											className={`badge ${data.isPublic ? 'text-bg-primary' : 'text-bg-secondary'}`}
										>
											{data.isPublic
												? t('pages.videoLoungesTable.public')
												: t('pages.videoLoungesTable.private')}
										</span>
										{data.isSystemManaged && (
											<span className="badge text-bg-info ms-2">
												{t('pages.videoLoungesTable.system')}
											</span>
										)}
									</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.videoLoungeDetail.faceLabel')}</label>
									<p>
										<Link to={getLocalizedPath(`/faces/${faceId}`)}>{faceId}</Link>
									</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.videoLoungeDetail.creatorLabel')}</label>
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
									<label>{t('pages.videoLoungeDetail.memberCount')}</label>
									<p>{formatValue(data.memberCount)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.videoLoungeDetail.maxParticipants')}</label>
									<p>{formatValue(data.maxParticipants)}</p>
								</div>
							</Col>
							<Col xs={12} md={4}>
								<div className="user-detail-field">
									<label>{t('pages.videoLoungeDetail.liveStatus')}</label>
									<p>
										{data.hasLiveSession ? (
											<span className="badge text-bg-danger">
												{t('pages.videoLoungeDetail.liveActive', {
													count: data.liveParticipantCount ?? 0,
												})}
											</span>
										) : (
											t('pages.videoLoungeDetail.liveInactive')
										)}
									</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.videoLoungeDetail.createdAt')}</label>
									<p>{formatDate(data.createdAt)}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.videoLoungeDetail.updatedAt')}</label>
									<p>{formatDate(data.updatedAt)}</p>
								</div>
							</Col>
						</Row>
					</div>

					<div className="user-detail-card" data-testid={VIDEO_LOUNGE_DETAIL_TEST_IDS.description}>
						<h2 className="user-detail-section-title">
							{t('pages.videoLoungeDetail.descriptionSection')}
						</h2>
						{data.description?.trim() ? (
							<ModerationPlainTextPreview text={data.description} />
						) : (
							<p className="text-muted">{t('pages.videoLoungeDetail.descriptionEmpty')}</p>
						)}
					</div>

					{showOperatorCard && (
						<div
							className="user-detail-card"
							data-testid={VIDEO_LOUNGE_DETAIL_TEST_IDS.operatorManagement}
						>
							<h2 className="user-detail-section-title">
								{t('pages.videoLoungeOperator.managementSection')}
							</h2>
							<p className="text-muted small">{t('pages.videoLoungeOperator.managementHint')}</p>
							<div className="user-detail-action-buttons mb-3">
								<Button
									variant="outline"
									disabled={!data.hasLiveSession || stealthJoin.isPending}
									title={
										data.hasLiveSession ? undefined : t('pages.videoLoungeOperator.noLiveSession')
									}
									data-testid="video-lounge-stealth-join"
									onClick={async () => {
										try {
											await stealthJoin.mutateAsync({ loungeId, faceId });
											toast.success(t('pages.videoLoungeOperator.stealthSuccess'));
										} catch (e) {
											toast.error(mutationErrorMessage(e));
										}
									}}
								>
									{t('pages.videoLoungeOperator.stealthJoin')}
								</Button>
								<Button
									variant="danger"
									disabled={!data.hasLiveSession || kickAll.isPending}
									data-testid="video-lounge-kick-all"
									onClick={async () => {
										try {
											await kickAll.mutateAsync({ loungeId, faceId, endSession: true });
											toast.success(t('pages.videoLoungeOperator.kickAllSuccess'));
										} catch (e) {
											toast.error(mutationErrorMessage(e));
										}
									}}
								>
									{t('pages.videoLoungeOperator.kickAll')}
								</Button>
							</div>

							<div data-testid={VIDEO_LOUNGE_DETAIL_TEST_IDS.operatorParticipants}>
								<h3 className="h6">{t('pages.videoLoungeOperator.liveParticipantsSection')}</h3>
								{!data.hasLiveSession ? (
									<p className="text-muted">{t('pages.videoLoungeOperator.noLiveSession')}</p>
								) : liveLoading ? (
									<p className="text-muted">{t('common.loading')}</p>
								) : operatorParticipants.length === 0 ? (
									<p className="text-muted">{t('pages.videoLoungeOperator.participantsEmpty')}</p>
								) : (
									<div className="d-flex flex-column gap-2">
										{operatorParticipants.map((p) => (
											<div
												key={p.userId}
												className="border rounded p-2 d-flex flex-wrap gap-3 align-items-center"
											>
												<div>
													<div className="small text-muted">
														{t('pages.videoLoungeOperator.colParticipant')}
													</div>
													<Link to={getLocalizedPath(`/users/${p.userId}`)}>
														{p.displayName || p.userId}
													</Link>
												</div>
												<div>
													<div className="small text-muted">
														{t('pages.videoLoungeOperator.colJoinMode')}
													</div>
													{p.joinMode}
													{!p.isListedInPublicRoster && (
														<span className="badge text-bg-dark ms-2">
															{t('pages.videoLoungeOperator.colStealth')}
														</span>
													)}
												</div>
												<Button
													variant="outline"
													className="ms-auto"
													data-testid={`video-lounge-kick-${p.userId}`}
													disabled={kickOne.isPending}
													onClick={async () => {
														try {
															await kickOne.mutateAsync({
																loungeId,
																faceId,
																userId: p.userId,
															});
															toast.success(t('pages.videoLoungeOperator.kickSuccess'));
														} catch (e) {
															toast.error(mutationErrorMessage(e));
														}
													}}
												>
													{t('pages.videoLoungeOperator.kick')}
												</Button>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</Container>
		</div>
	);
}
