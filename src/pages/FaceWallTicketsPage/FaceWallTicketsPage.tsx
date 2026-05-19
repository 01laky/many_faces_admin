import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Container, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { useFace } from '@/hooks/api/useFacesApi';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { Button } from '@/components/radix/Button';
import {
	adminListWallTickets,
	adminGetWallTicket,
	adminCreateWallTicket,
	adminPostWallTicketComment,
	adminApproveWallTicket,
	adminDenyWallTicket,
	adminDeleteWallTicket,
	adminDeleteWallTicketComment,
	type AdminWallTicketRow,
	type AdminWallTicketDetail,
} from '@/api/services/wallTicketsAdminApi';
import {
	parseWallTicketIdFromSearch,
	statusFilterToQuery,
	wallTicketActionsForStatus,
	wallTicketDetailSearchParams,
	type WallTicketStatusFilter,
} from '@/utils/wallTicketModeration';
import './FaceWallTicketsPage.scss';

function statusLabelKey(status: string): string {
	const s = status.toLowerCase();
	if (s === 'approved') return 'pages.faceWallTickets.statusApproved';
	if (s === 'denied') return 'pages.faceWallTickets.statusDenied';
	return 'pages.faceWallTickets.statusActive';
}

function WallTicketStatusBadge({ status }: { status: string }) {
	const { t } = useTranslation('common');
	const s = status.toLowerCase();
	const cls =
		s === 'approved'
			? 'face-wall-tickets-page__badge--approved'
			: s === 'denied'
				? 'face-wall-tickets-page__badge--denied'
				: 'face-wall-tickets-page__badge--active';
	return (
		<span className={`face-wall-tickets-page__badge ${cls}`}>{t(statusLabelKey(status))}</span>
	);
}

export function FaceWallTicketsPage() {
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [searchParams, setSearchParams] = useSearchParams();
	const { token } = useAuth();
	const { confirm, ConfirmModalHost } = useConfirmModal();
	const faceId = id ? parseInt(id, 10) : 0;
	const { data: face } = useFace(faceId);

	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<WallTicketStatusFilter>('');
	const [items, setItems] = useState<AdminWallTicketRow[]>([]);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);
	const [forbidden, setForbidden] = useState(false);
	const [selected, setSelected] = useState<AdminWallTicketDetail | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);
	const [actionBusy, setActionBusy] = useState(false);

	const [showCreate, setShowCreate] = useState(false);
	const [createTitle, setCreateTitle] = useState('');
	const [createDescription, setCreateDescription] = useState('');
	const [commentDraft, setCommentDraft] = useState('');

	const statusQuery = useMemo(() => statusFilterToQuery(statusFilter), [statusFilter]);

	const loadList = useCallback(async () => {
		if (!faceId || !token) {
			setLoading(false);
			return;
		}
		setLoading(true);
		setForbidden(false);
		try {
			const res = await adminListWallTickets(token, faceId, page, 20, statusQuery);
			setItems(res.items);
			setTotalPages(Math.max(1, res.totalPages));
		} catch (err) {
			const msg = err instanceof Error ? err.message : '';
			if (/403|forbidden/i.test(msg)) {
				setForbidden(true);
				setItems([]);
			} else {
				toast.error(msg || t('pages.faceWallTickets.loadError'));
				setItems([]);
			}
		} finally {
			setLoading(false);
		}
	}, [faceId, token, page, statusQuery, t]);

	useEffect(() => {
		// Fetch list when face, token, page, or status filter changes (admin-scoped API).
		// eslint-disable-next-line react-hooks/set-state-in-effect -- data load on dependency change
		void loadList();
	}, [loadList]);

	const openDetail = useCallback(
		async (ticketId: number) => {
			if (!token) return;
			setDetailLoading(true);
			try {
				const d = await adminGetWallTicket(token, faceId, ticketId);
				setSelected(d);
			} catch (err) {
				toast.error(
					err instanceof Error && err.message ? err.message : t('pages.faceWallTickets.loadError')
				);
			} finally {
				setDetailLoading(false);
			}
		},
		[token, faceId, t]
	);

	useEffect(() => {
		if (!token || !faceId) return;
		const ticketId = parseWallTicketIdFromSearch(searchParams.get('ticketId'));
		if (ticketId != null) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- deep-link ?ticketId= opens detail once
			void openDetail(ticketId);
		}
	}, [searchParams, token, faceId, openDetail]);

	const refreshAll = async (ticketIdToSelect?: number) => {
		await loadList();
		const idToLoad = ticketIdToSelect ?? selected?.id;
		if (idToLoad && token) {
			try {
				const d = await adminGetWallTicket(token, faceId, idToLoad);
				setSelected(d);
			} catch {
				setSelected(null);
			}
		}
	};

	const act = async (fn: () => Promise<void>, okMsg: string) => {
		setActionBusy(true);
		try {
			await fn();
			toast.success(okMsg);
			await refreshAll();
		} catch (err) {
			toast.error(
				err instanceof Error && err.message ? err.message : t('pages.faceWallTickets.actionError')
			);
		} finally {
			setActionBusy(false);
		}
	};

	const handleCreate = async () => {
		if (!token || !createTitle.trim() || !createDescription.trim()) return;
		setActionBusy(true);
		try {
			const created = await adminCreateWallTicket(token, faceId, {
				title: createTitle.trim(),
				description: createDescription.trim(),
			});
			toast.success(t('pages.faceWallTickets.created'));
			setShowCreate(false);
			setCreateTitle('');
			setCreateDescription('');
			await refreshAll(created.id);
			setSearchParams(wallTicketDetailSearchParams(created.id));
		} catch (err) {
			toast.error(
				err instanceof Error && err.message ? err.message : t('pages.faceWallTickets.actionError')
			);
		} finally {
			setActionBusy(false);
		}
	};

	const handlePostComment = async () => {
		if (!token || !selected || !commentDraft.trim()) return;
		const content = commentDraft.trim();
		if (content.length > 255) return;
		await act(
			() => adminPostWallTicketComment(token, faceId, selected.id, content),
			t('pages.faceWallTickets.commentPosted')
		);
		setCommentDraft('');
	};

	const detailActions = selected ? wallTicketActionsForStatus(selected.status) : null;

	const selectRow = (row: AdminWallTicketRow) => {
		setSearchParams(wallTicketDetailSearchParams(row.id));
		void openDetail(row.id);
	};

	if (!faceId) {
		return (
			<Container className="face-wall-tickets-page py-4">
				{t('pages.faceWallTickets.badFace')}
			</Container>
		);
	}

	const faceLabel = face?.title ?? face?.index ?? String(faceId);

	return (
		<Container className="face-wall-tickets-page py-4" fluid>
			{ConfirmModalHost}
			<div className="face-wall-tickets-page__header">
				<Button variant="outline" onClick={() => navigate(getLocalizedPath(`/faces/${faceId}`))}>
					← {t('common.back')}
				</Button>
				<div>
					<h1>{t('pages.faceWallTickets.title')}</h1>
					<p className="text-muted mb-0">
						{t('pages.faceWallTickets.faceContext', { name: faceLabel, id: faceId })}
					</p>
				</div>
				<Button disabled={actionBusy || forbidden} onClick={() => setShowCreate(true)}>
					{t('pages.faceWallTickets.createTicket')}
				</Button>
			</div>

			{forbidden && (
				<Alert variant="warning" className="mt-3">
					{t('pages.faceWallTickets.forbidden')}
				</Alert>
			)}

			<div className="face-wall-tickets-page__filters">
				{(
					[
						['', 'pages.faceWallTickets.filterAll'],
						['active', 'pages.faceWallTickets.filterActive'],
						['approved', 'pages.faceWallTickets.filterApproved'],
						['denied', 'pages.faceWallTickets.filterDenied'],
					] as const
				).map(([value, labelKey]) => (
					<Button
						key={value || 'all'}
						variant={statusFilter === value ? 'primary' : 'outline'}
						size="sm"
						disabled={actionBusy}
						onClick={() => {
							setStatusFilter(value);
							setPage(1);
						}}
					>
						{t(labelKey)}
					</Button>
				))}
			</div>

			<div className="face-wall-tickets-page__split">
				<div className="face-wall-tickets-page__list-pane">
					{loading && <p>{t('pages.faceWallTickets.loading')}</p>}
					{!loading && !forbidden && items.length === 0 && (
						<div className="face-wall-tickets-page__empty">
							<h2 className="h5">{t('pages.faceWallTickets.emptyTitle')}</h2>
							<p>{t('pages.faceWallTickets.emptyHint')}</p>
							<Button onClick={() => setShowCreate(true)}>
								{t('pages.faceWallTickets.createTicket')}
							</Button>
						</div>
					)}
					{!loading && items.length > 0 && (
						<div className="table-responsive">
							<table className="table table-sm table-striped align-middle">
								<thead>
									<tr>
										<th>{t('pages.faceWallTickets.colId')}</th>
										<th>{t('pages.faceWallTickets.colTitle')}</th>
										<th>{t('pages.faceWallTickets.colStatus')}</th>
										<th>{t('pages.faceWallTickets.colCreator')}</th>
										<th>{t('pages.faceWallTickets.colCounts')}</th>
									</tr>
								</thead>
								<tbody>
									{items.map((row) => (
										<tr
											key={row.id}
											className={
												selected?.id === row.id ? 'face-wall-tickets-page__row--selected' : ''
											}
											onClick={() => selectRow(row)}
											role="button"
											tabIndex={0}
											onKeyDown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') selectRow(row);
											}}
										>
											<td>{row.id}</td>
											<td>{row.title}</td>
											<td>
												<WallTicketStatusBadge status={row.status} />
											</td>
											<td onClick={(e) => e.stopPropagation()}>
												{row.creatorId ? (
													<Link to={getLocalizedPath(`/users/${row.creatorId}`)}>
														{row.creatorName || row.creatorId}
													</Link>
												) : (
													row.creatorName
												)}
											</td>
											<td>
												{row.likesCount} / {row.commentsCount}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{totalPages > 1 && (
						<div className="face-wall-tickets-page__pager">
							<Button
								variant="outline"
								disabled={page <= 1 || actionBusy}
								onClick={() => setPage((p) => p - 1)}
							>
								{t('pages.faceWallTickets.prev')}
							</Button>
							<span>
								{page} / {totalPages}
							</span>
							<Button
								variant="outline"
								disabled={page >= totalPages || actionBusy}
								onClick={() => setPage((p) => p + 1)}
							>
								{t('pages.faceWallTickets.next')}
							</Button>
						</div>
					)}
				</div>

				<div className="face-wall-tickets-page__detail-pane">
					{detailLoading && <p>{t('pages.faceWallTickets.detailLoading')}</p>}
					{!detailLoading && !selected && (
						<p className="text-muted">{t('pages.faceWallTickets.closeDetail')}</p>
					)}
					{selected && (
						<div className="face-wall-tickets-page__detail card p-3">
							<div className="d-flex justify-content-between align-items-start gap-2">
								<div>
									<h2 className="h5 mb-1">{selected.title}</h2>
									<p className="text-muted small mb-0">
										#{selected.id} · <WallTicketStatusBadge status={selected.status} />
									</p>
								</div>
								<Button
									variant="outline"
									disabled={actionBusy}
									onClick={() => {
										setSelected(null);
										setSearchParams({});
									}}
								>
									{t('pages.faceWallTickets.closeDetail')}
								</Button>
							</div>
							<p className="small mb-2">
								{selected.creatorId ? (
									<Link to={getLocalizedPath(`/users/${selected.creatorId}`)}>
										{selected.creatorName || selected.creatorId}
									</Link>
								) : (
									selected.creatorName
								)}
								<span className="text-muted ms-2">
									{new Date(selected.createdAt).toLocaleString()}
								</span>
							</p>
							{selected.status === 'denied' && (
								<Alert variant="secondary" className="py-2 small">
									{t('pages.faceWallTickets.deniedScheduledHint')}
								</Alert>
							)}
							{selected.status === 'approved' && (
								<Alert variant="info" className="py-2 small">
									{t('pages.faceWallTickets.approvedFrozenHint')}
								</Alert>
							)}
							<p className="face-wall-tickets-page__body">{selected.description}</p>

							<div className="face-wall-tickets-page__detail-actions d-flex flex-wrap gap-2 mb-3">
								{detailActions?.canApprove && (
									<Button
										variant="outline"
										disabled={actionBusy}
										onClick={() =>
											void act(
												() => adminApproveWallTicket(token!, faceId, selected.id),
												t('pages.faceWallTickets.approved')
											)
										}
									>
										{t('pages.faceWallTickets.approve')}
									</Button>
								)}
								{detailActions?.canDeny && (
									<Button
										variant="outline"
										disabled={actionBusy}
										onClick={async () => {
											const ok = await confirm({
												title: t('pages.faceWallTickets.confirmDenyTitle'),
												message: t('pages.faceWallTickets.confirmDeny'),
												confirmLabel: t('pages.faceWallTickets.deny'),
												confirmVariant: 'danger',
											});
											if (!ok) return;
											void act(
												() => adminDenyWallTicket(token!, faceId, selected.id),
												t('pages.faceWallTickets.denied')
											);
										}}
									>
										{t('pages.faceWallTickets.deny')}
									</Button>
								)}
								{detailActions?.canDeleteTicket && (
									<Button
										variant="outline"
										className="text-danger"
										disabled={actionBusy}
										onClick={async () => {
											const ok = await confirm({
												title: t('pages.faceWallTickets.confirmDeleteTitle'),
												message: t('pages.faceWallTickets.confirmDeleteTicket'),
												confirmLabel: t('pages.faceWallTickets.deleteTicket'),
												confirmVariant: 'danger',
											});
											if (!ok) return;
											void act(async () => {
												await adminDeleteWallTicket(token!, faceId, selected.id);
												setSelected(null);
												setSearchParams({});
											}, t('pages.faceWallTickets.deletedTicket'));
										}}
									>
										{t('pages.faceWallTickets.deleteTicket')}
									</Button>
								)}
							</div>

							<h3 className="h6">{t('pages.faceWallTickets.comments')}</h3>
							{detailActions?.canAddComment && (
								<div className="d-flex gap-2 mb-3">
									<Form.Control
										as="textarea"
										rows={2}
										maxLength={255}
										value={commentDraft}
										aria-label={t('pages.faceWallTickets.addComment')}
										placeholder={t('pages.faceWallTickets.addComment')}
										disabled={actionBusy}
										onChange={(e) => setCommentDraft(e.target.value)}
									/>
									<Button
										disabled={actionBusy || !commentDraft.trim()}
										onClick={() => void handlePostComment()}
									>
										{t('pages.faceWallTickets.sendComment')}
									</Button>
								</div>
							)}
							<ul className="list-unstyled mb-0">
								{selected.comments.map((c) => (
									<li key={c.id} className="border-bottom py-2">
										<strong>{c.authorName}</strong>
										<span className="text-muted small ms-2">
											{new Date(c.createdAt).toLocaleString()}
										</span>
										<p className="mb-1">{c.content}</p>
										{detailActions?.canDeleteComment && (
											<Button
												variant="outline"
												className="text-danger"
												size="sm"
												disabled={actionBusy}
												onClick={async () => {
													const ok = await confirm({
														title: t('pages.faceWallTickets.deleteComment'),
														message: t('pages.faceWallTickets.confirmDeleteComment'),
														confirmLabel: t('common.delete'),
														confirmVariant: 'danger',
													});
													if (!ok) return;
													void act(
														() => adminDeleteWallTicketComment(token!, faceId, selected.id, c.id),
														t('pages.faceWallTickets.deletedComment')
													);
												}}
											>
												{t('pages.faceWallTickets.deleteComment')}
											</Button>
										)}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</div>

			<Modal show={showCreate} onHide={() => !actionBusy && setShowCreate(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>{t('pages.faceWallTickets.createTitle')}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form.Group className="mb-3">
						<Form.Label>{t('pages.faceWallTickets.fieldTitle')}</Form.Label>
						<Form.Control
							maxLength={200}
							value={createTitle}
							disabled={actionBusy}
							onChange={(e) => setCreateTitle(e.target.value)}
						/>
					</Form.Group>
					<Form.Group>
						<Form.Label>{t('pages.faceWallTickets.fieldDescription')}</Form.Label>
						<Form.Control
							as="textarea"
							rows={5}
							maxLength={8000}
							value={createDescription}
							disabled={actionBusy}
							onChange={(e) => setCreateDescription(e.target.value)}
						/>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline" disabled={actionBusy} onClick={() => setShowCreate(false)}>
						{t('common.cancel')}
					</Button>
					<Button
						disabled={actionBusy || !createTitle.trim() || !createDescription.trim()}
						onClick={() => void handleCreate()}
					>
						{t('pages.faceWallTickets.createTicket')}
					</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	);
}
