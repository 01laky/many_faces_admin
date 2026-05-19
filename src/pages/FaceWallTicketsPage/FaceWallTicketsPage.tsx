import { useMemo, useState } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Container, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { useFace } from '@/hooks/api/useFacesApi';
import {
	useAdminApproveWallTicket,
	useAdminCreateWallTicket,
	useAdminDeleteWallTicket,
	useAdminDeleteWallTicketComment,
	useAdminDenyWallTicket,
	useAdminPostWallTicketComment,
	useAdminWallTicketDetail,
	useAdminWallTicketsList,
	isWallTicketsForbiddenError,
	type AdminWallTicketRow,
} from '@/hooks/api/useWallTicketsAdminApi';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { Button } from '@/components/radix/Button';
import { WallTicketsTable, WallTicketStatusBadge } from '@/components/tables/WallTicketsTable';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import {
	parseWallTicketIdFromSearch,
	statusFilterToQuery,
	wallTicketActionsForStatus,
	wallTicketDetailSearchParams,
	type WallTicketStatusFilter,
} from '@/utils/wallTicketModeration';
import './FaceWallTicketsPage.scss';

export function FaceWallTicketsPage() {
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [searchParams, setSearchParams] = useSearchParams();
	const { confirm, ConfirmModalHost } = useConfirmModal();
	const faceId = id ? parseInt(id, 10) : 0;
	const { data: face } = useFace(faceId);

	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<WallTicketStatusFilter>('');
	const [showCreate, setShowCreate] = useState(false);
	const [createTitle, setCreateTitle] = useState('');
	const [createDescription, setCreateDescription] = useState('');
	const [commentDraft, setCommentDraft] = useState('');

	const statusQuery = useMemo(() => statusFilterToQuery(statusFilter), [statusFilter]);
	const ticketIdFromUrl = parseWallTicketIdFromSearch(searchParams.get('ticketId'));

	const {
		data: listData,
		isLoading: listLoading,
		isError: listIsError,
		error: listError,
	} = useAdminWallTicketsList(faceId, page, ADMIN_TABLE_PAGE_SIZE, statusQuery);

	const {
		data: selected,
		isLoading: detailLoading,
		isFetching: detailFetching,
	} = useAdminWallTicketDetail(faceId, ticketIdFromUrl);

	const createTicket = useAdminCreateWallTicket();
	const approveTicket = useAdminApproveWallTicket();
	const denyTicket = useAdminDenyWallTicket();
	const deleteTicket = useAdminDeleteWallTicket();
	const postComment = useAdminPostWallTicketComment();
	const deleteComment = useAdminDeleteWallTicketComment();

	const forbidden = listIsError && isWallTicketsForbiddenError(listError);
	const items = listData?.items ?? [];
	const totalPages = Math.max(1, listData?.totalPages ?? 1);
	const loading = listLoading;
	const actionBusy =
		createTicket.isPending ||
		approveTicket.isPending ||
		denyTicket.isPending ||
		deleteTicket.isPending ||
		postComment.isPending ||
		deleteComment.isPending;

	const detailActions = selected ? wallTicketActionsForStatus(selected.status) : null;

	const selectRow = (row: AdminWallTicketRow) => {
		setSearchParams(wallTicketDetailSearchParams(row.id));
	};

	const handleCreate = async () => {
		if (!createTitle.trim() || !createDescription.trim()) return;
		try {
			const created = await createTicket.mutateAsync({
				faceId,
				body: {
					title: createTitle.trim(),
					description: createDescription.trim(),
				},
			});
			toast.success(t('pages.faceWallTickets.created'));
			setShowCreate(false);
			setCreateTitle('');
			setCreateDescription('');
			setSearchParams(wallTicketDetailSearchParams(created.id));
		} catch (err) {
			toast.error(
				err instanceof Error && err.message ? err.message : t('pages.faceWallTickets.actionError')
			);
		}
	};

	const handlePostComment = async () => {
		if (!selected || !commentDraft.trim() || commentDraft.trim().length > 255) return;
		try {
			await postComment.mutateAsync({
				faceId,
				ticketId: selected.id,
				content: commentDraft.trim(),
			});
			toast.success(t('pages.faceWallTickets.commentPosted'));
			setCommentDraft('');
		} catch (err) {
			toast.error(
				err instanceof Error && err.message ? err.message : t('pages.faceWallTickets.actionError')
			);
		}
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

			{listIsError && !forbidden && (
				<Alert variant="danger" className="mt-3">
					{listError instanceof Error ? listError.message : t('pages.faceWallTickets.loadError')}
				</Alert>
			)}

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
						<WallTicketsTable
							items={items}
							selectedId={selected?.id}
							onSelectRow={selectRow}
							page={page}
							totalPages={totalPages}
							onPageChange={setPage}
							disabled={actionBusy}
						/>
					)}
				</div>

				<div className="face-wall-tickets-page__detail-pane">
					{(detailLoading || detailFetching) && ticketIdFromUrl != null && (
						<p>{t('pages.faceWallTickets.detailLoading')}</p>
					)}
					{!detailLoading && !selected && ticketIdFromUrl == null && (
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
								<Button variant="outline" disabled={actionBusy} onClick={() => setSearchParams({})}>
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
											void approveTicket.mutateAsync(
												{ faceId, ticketId: selected.id },
												{
													onSuccess: () => toast.success(t('pages.faceWallTickets.approved')),
													onError: (err) =>
														toast.error(
															err instanceof Error
																? err.message
																: t('pages.faceWallTickets.actionError')
														),
												}
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
											void denyTicket.mutateAsync(
												{ faceId, ticketId: selected.id },
												{
													onSuccess: () => toast.success(t('pages.faceWallTickets.denied')),
													onError: (err) =>
														toast.error(
															err instanceof Error
																? err.message
																: t('pages.faceWallTickets.actionError')
														),
												}
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
											try {
												await deleteTicket.mutateAsync({
													faceId,
													ticketId: selected.id,
												});
												setSearchParams({});
												toast.success(t('pages.faceWallTickets.deletedTicket'));
											} catch (err) {
												toast.error(
													err instanceof Error
														? err.message
														: t('pages.faceWallTickets.actionError')
												);
											}
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
													void deleteComment.mutateAsync(
														{
															faceId,
															ticketId: selected.id,
															commentId: c.id,
														},
														{
															onSuccess: () =>
																toast.success(t('pages.faceWallTickets.deletedComment')),
															onError: (err) =>
																toast.error(
																	err instanceof Error
																		? err.message
																		: t('pages.faceWallTickets.actionError')
																),
														}
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
