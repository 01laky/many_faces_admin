/**
 * Super-admin two-pane inbox: conversation list + real-time thread with end users.
 * Uses REST for history/pagination and MessengerHub SendPlatformDirectMessage for sends.
 * Deep link: /{lang}/user-chat?u={userId} (localized slug via routeTranslations).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HubConnectionState, type HubConnection } from '@microsoft/signalr';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { buildAdminMessengerHubConnection } from '@/api/signalr/buildAdminMessengerHubConnection';
import { resolveHubAccessToken } from '@/utils/authStorage';
import type { InfiniteData } from '@tanstack/react-query';
import type { OperatorUserChatHistoryPage } from '@/api/operatorUserChatApiClient';
import { useOperatorUserDetail } from '@/hooks/api/useOperatorUsersApi';
import {
	operatorUserChatConversationsKey,
	operatorUserChatMessagesKey,
	useMarkOperatorUserChatRead,
	useOperatorUserChatConversations,
	useOperatorUserChatMessagesInfinite,
	patchOperatorUserChatInfiniteFirstPage,
} from '@/hooks/api/useOperatorUserChatApi';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { mapOperatorUserChatHubError } from '@/utils/operatorUserChatHubErrors';
import {
	appendUserChatMessage,
	replaceOptimisticUserChatMessage,
	type UiUserChatMessage,
} from '@/utils/userChatMessageMerge';
import { isSuperAdminFromToken } from '@/utils/platformAccess';
import { formatOperatorUserDisplayName } from '@/utils/operatorUserDetailUi';
import { Button } from '@/components/radix/Button';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import '../ChatPage/ChatPage.scss';

const MAX_MESSAGE_LENGTH = 4000;
type ConnectionState = 'Connecting' | 'Connected' | 'Disconnected' | 'Reconnecting';

function parseTargetUserId(search: string): string | null {
	const u = new URLSearchParams(search).get('u');
	return u?.trim() ? u.trim() : null;
}

/** Starts hub when disconnected; no-op when already connected or negotiating. */
async function startMessengerHubIfNeeded(
	connection: HubConnection,
	isActive: () => boolean,
	setConnectionState: (state: ConnectionState) => void
): Promise<void> {
	if (!isActive()) return;
	if (
		connection.state === HubConnectionState.Connected ||
		connection.state === HubConnectionState.Connecting ||
		connection.state === HubConnectionState.Reconnecting
	) {
		if (connection.state === HubConnectionState.Connected && isActive()) {
			setConnectionState('Connected');
		}
		return;
	}
	setConnectionState('Connecting');
	try {
		if (connection.state === HubConnectionState.Disconnected) {
			await connection.start();
		}
		if (isActive()) setConnectionState('Connected');
	} catch (err) {
		console.error('Messenger hub connect failed:', err);
		if (isActive()) setConnectionState('Disconnected');
	}
}

export function UserChatPage() {
	const { t } = useTranslation('common');
	const { token, isAuthenticated, user } = useAuth();
	const [searchParams, setSearchParams] = useSearchParams();
	const selectedUserId = parseTargetUserId(searchParams.toString());
	const getLocalizedPath = useLocalizedLink();
	const queryClient = useQueryClient();

	const { data: conversations = [], isLoading: listLoading } = useOperatorUserChatConversations();
	const {
		data: infiniteHistory,
		isLoading: messagesLoading,
		isFetching: messagesFetching,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useOperatorUserChatMessagesInfinite(selectedUserId, selectedUserId != null);
	const markRead = useMarkOperatorUserChatRead();

	const [pending, setPending] = useState<UiUserChatMessage[]>([]);
	const [input, setInput] = useState('');
	const [connectionState, setConnectionState] = useState<ConnectionState>('Disconnected');
	const [sidebarFilter, setSidebarFilter] = useState('');
	const loadingOlder = isFetchingNextPage;

	const { data: targetUserDetail } = useOperatorUserDetail(selectedUserId ?? '');

	const connectionRef = useRef<HubConnection | null>(null);
	const hubSessionRef = useRef(0);
	const tokenRef = useRef(token);
	const selectedUserIdRef = useRef(selectedUserId);
	const userIdRef = useRef(user?.id);
	const tRef = useRef(t);
	const queryClientRef = useRef(queryClient);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		tRef.current = t;
		queryClientRef.current = queryClient;
	});
	useEffect(() => {
		tokenRef.current = token;
	}, [token]);
	useEffect(() => {
		selectedUserIdRef.current = selectedUserId;
	}, [selectedUserId]);
	useEffect(() => {
		userIdRef.current = user?.id;
	}, [user?.id]);

	const serverMessages = useMemo(() => {
		const pages = infiniteHistory?.pages ?? [];
		const first = pages[0];
		const latest = first?.items ?? [];
		const older = pages.slice(1).flatMap((p) => p.items);
		return [...older, ...latest];
	}, [infiniteHistory]);

	// Merge REST pages and optimistic/hub rows without duplicate ids.
	const messages = useMemo(() => {
		const merged: UiUserChatMessage[] = [...serverMessages];
		const ids = new Set<number>();
		const deduped: UiUserChatMessage[] = [];
		for (const m of merged) {
			if (m.id > 0 && ids.has(m.id)) continue;
			if (m.id > 0) ids.add(m.id);
			deduped.push(m);
		}
		for (const p of pending) {
			if (!ids.has(p.id)) deduped.push(p);
		}
		return deduped;
	}, [serverMessages, pending]);

	const filteredConversations = useMemo(() => {
		const q = sidebarFilter.trim().toLowerCase();
		if (!q) return conversations;
		return conversations.filter(
			(c) =>
				c.otherUserDisplayName.toLowerCase().includes(q) ||
				c.otherUserEmail.toLowerCase().includes(q)
		);
	}, [conversations, sidebarFilter]);

	const selectedConversation = conversations.find((c) => c.otherUserId === selectedUserId);
	const hasMore = hasNextPage ?? infiniteHistory?.pages[0]?.hasMore ?? false;

	const threadDisplayName = useMemo(() => {
		if (!selectedUserId) return '';
		const fromList = selectedConversation?.otherUserDisplayName?.trim();
		if (fromList && fromList !== selectedUserId) return fromList;
		if (targetUserDetail) return formatOperatorUserDisplayName(targetUserDetail);
		return '';
	}, [selectedConversation, targetUserDetail, selectedUserId]);

	const threadEmail =
		selectedConversation?.otherUserEmail?.trim() || targetUserDetail?.email?.trim() || '';
	const showThreadEmail =
		Boolean(threadEmail) && threadEmail !== threadDisplayName && threadEmail !== selectedUserId;

	const setSelectedUserId = useCallback(
		(id: string | null) => {
			setPending([]);
			if (id == null) setSearchParams({});
			else {
				setSearchParams({ u: id });
				void markRead.mutateAsync(id).catch(() => undefined);
			}
		},
		[setSearchParams, markRead]
	);

	const handleLoadOlder = async () => {
		if (!selectedUserId || loadingOlder || !hasMore) return;
		await fetchNextPage();
	};

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	// Single hub connection per authenticated super-admin session; handlers use refs for selected thread.
	useEffect(() => {
		if (!isAuthenticated || !token || !isSuperAdminFromToken(token)) {
			return;
		}

		const hubSession = hubSessionRef;
		const sessionId = ++hubSession.current;
		let startInFlight = false;
		const getAccessToken = () => resolveHubAccessToken(tokenRef.current);
		const connection = buildAdminMessengerHubConnection(getAccessToken);
		connectionRef.current = connection;
		let cancelled = false;

		const isActiveSession = () => !cancelled && hubSession.current === sessionId;

		connection.on(
			'ReceiveChatMessage',
			(
				senderId: string,
				_senderName: string,
				content: string,
				sentAt: string,
				messageId: number
			) => {
				const target = selectedUserIdRef.current;
				const me = userIdRef.current;
				if (!target) return;
				// Accept inbound user messages and caller echo for the open thread only.
				const isThread = senderId === target || (senderId === me && target != null);
				if (!isThread) return;

				const msg: UiUserChatMessage = {
					id: messageId,
					senderId,
					senderName: _senderName,
					senderGlobalRole: null,
					isPlatformAdministrator: senderId === me,
					content,
					sentAt: typeof sentAt === 'string' ? sentAt : new Date(sentAt).toISOString(),
					readAt: null,
				};

				const qc = queryClientRef.current;
				const key = [...operatorUserChatMessagesKey(target), 'infinite'] as const;

				if (senderId === me) {
					qc.setQueryData<InfiniteData<OperatorUserChatHistoryPage>>(key, (old) =>
						patchOperatorUserChatInfiniteFirstPage(old, (page) => ({
							...page,
							items: replaceOptimisticUserChatMessage(page.items, msg, me ?? ''),
						}))
					);
					setPending((prev) =>
						prev.filter(
							(m) => !(m.pending && m.id < 0 && m.senderId === me && m.content === content)
						)
					);
				} else {
					qc.setQueryData<InfiniteData<OperatorUserChatHistoryPage>>(key, (old) =>
						patchOperatorUserChatInfiniteFirstPage(old, (page) => ({
							...page,
							items: appendUserChatMessage(page.items, msg),
						}))
					);
					setPending((prev) => appendUserChatMessage(prev, msg));
				}
				void queryClientRef.current.invalidateQueries({
					queryKey: operatorUserChatConversationsKey,
				});
			}
		);

		connection.on('ReceivePlatformChatError', (code: string) => {
			toast.error(mapOperatorUserChatHubError(tRef.current, code));
		});

		connection.onreconnecting(() => {
			if (isActiveSession()) setConnectionState('Reconnecting');
		});
		connection.onreconnected(() => {
			if (isActiveSession()) setConnectionState('Connected');
		});
		connection.onclose(() => {
			if (isActiveSession()) setConnectionState('Disconnected');
		});

		const startHub = async () => {
			if (!isActiveSession() || startInFlight) return;
			startInFlight = true;
			try {
				await startMessengerHubIfNeeded(connection, isActiveSession, setConnectionState);
			} finally {
				startInFlight = false;
			}
		};

		// Defer negotiate so Strict Mode cleanup (detail → user-chat deep link) does not abort in-flight start.
		const startTimerId = window.setTimeout(() => {
			void startHub();
		}, 50);

		const onVisible = () => {
			if (document.visibilityState !== 'visible') return;
			void queryClientRef.current.invalidateQueries({ queryKey: operatorUserChatConversationsKey });
			const tid = selectedUserIdRef.current;
			if (tid)
				void queryClientRef.current.invalidateQueries({
					queryKey: operatorUserChatMessagesKey(tid),
				});
		};
		document.addEventListener('visibilitychange', onVisible);

		return () => {
			cancelled = true;
			window.clearTimeout(startTimerId);
			document.removeEventListener('visibilitychange', onVisible);
			// Strict Mode remount: a newer session already owns the hub — do not stop it.
			if (hubSession.current !== sessionId) return;
			const conn = connection;
			void (async () => {
				try {
					if (conn.state !== HubConnectionState.Disconnected) {
						await conn.stop();
					}
				} catch (err) {
					console.warn('Messenger hub stop during teardown:', err);
				} finally {
					if (connectionRef.current === conn) {
						connectionRef.current = null;
					}
					if (hubSession.current === sessionId) {
						setConnectionState('Disconnected');
					}
				}
			})();
		};
		// token via tokenRef — omit from deps to avoid hub stop during negotiation (e.g. deep link from content detail)
		// eslint-disable-next-line react-hooks/exhaustive-deps -- hub lifetime tied to auth gate only
	}, [isAuthenticated]);

	const handleReconnect = useCallback(async () => {
		const conn = connectionRef.current;
		if (!conn || !token || !isSuperAdminFromToken(token)) return;
		await startMessengerHubIfNeeded(conn, () => true, setConnectionState);
		if (connectionRef.current?.state !== HubConnectionState.Connected) {
			toast.error(t('pages.userChat.hub.errors.unknown'));
		}
	}, [token, t]);

	// Deep link from content detail (story/reel/blog → user-chat?u=) can miss hub start after Strict Mode; staggered retries.
	useEffect(() => {
		if (!selectedUserId || !isAuthenticated || !token || !isSuperAdminFromToken(token)) return;

		const delaysMs = [120, 400, 900];
		const timerIds = delaysMs.map((delay) =>
			window.setTimeout(() => {
				const conn = connectionRef.current;
				if (!conn) return;
				if (
					conn.state === HubConnectionState.Connected ||
					conn.state === HubConnectionState.Connecting ||
					conn.state === HubConnectionState.Reconnecting
				) {
					return;
				}
				void startMessengerHubIfNeeded(conn, () => true, setConnectionState);
			}, delay)
		);

		return () => timerIds.forEach((id) => window.clearTimeout(id));
	}, [selectedUserId, isAuthenticated, token]);

	const handleSend = async () => {
		const text = input.trim();
		if (!text || !selectedUserId || connectionState !== 'Connected') return;
		if (text.length > MAX_MESSAGE_LENGTH) {
			toast.error(t('pages.userChat.hub.errors.message_too_long'));
			return;
		}

		const conn = connectionRef.current;
		if (!conn) return;

		const optimistic: UiUserChatMessage = {
			id: -Date.now(),
			senderId: userIdRef.current ?? '',
			senderName: user?.email ?? 'You',
			senderGlobalRole: 'SUPER_ADMIN',
			isPlatformAdministrator: true,
			content: text,
			sentAt: new Date().toISOString(),
			readAt: null,
			pending: true,
		};
		setPending((prev) => [...prev, optimistic]);
		setInput('');

		try {
			await conn.invoke('SendPlatformDirectMessage', selectedUserId, text);
			void queryClient.invalidateQueries({ queryKey: operatorUserChatConversationsKey });
		} catch (err) {
			console.error(err);
			toast.error(t('pages.userChat.hub.errors.unknown'));
			setPending((prev) => prev.filter((m) => m.id !== optimistic.id));
		}
	};

	if (!isSuperAdminFromToken(token)) {
		return (
			<div className="chat-page-shell">
				<p>{t('pages.userChat.forbidden')}</p>
			</div>
		);
	}

	const statusLabel =
		connectionState === 'Connected'
			? t('pages.userChat.connected')
			: connectionState === 'Reconnecting'
				? t('pages.userChat.connecting')
				: connectionState === 'Connecting'
					? t('pages.userChat.connecting')
					: t('pages.userChat.disconnected');

	return (
		<div className="chat-page-shell">
			<div className="chat-page">
				<aside className="chat-page__sidebar">
					<div className="chat-page__sidebar-header">
						<h1 className="chat-page__title">{t('pages.userChat.title')}</h1>
					</div>
					<input
						type="search"
						className="chat-page__input chat-page__sidebar-search"
						placeholder={t('pages.userChat.searchPlaceholder')}
						value={sidebarFilter}
						onChange={(e) => setSidebarFilter(e.target.value)}
					/>
					<div className="chat-page__thread-list">
						{listLoading && (
							<p className="chat-page__sidebar-hint">{t('pages.userChat.loading')}</p>
						)}
						{!listLoading && filteredConversations.length === 0 && (
							<p className="chat-page__sidebar-hint">{t('pages.userChat.emptyConversations')}</p>
						)}
						{filteredConversations.map((c) => (
							<button
								key={c.otherUserId}
								type="button"
								className={`chat-page__thread${c.otherUserId === selectedUserId ? ' chat-page__thread--active' : ''}`}
								onClick={() => setSelectedUserId(c.otherUserId)}
							>
								<span className="chat-page__thread-title">{c.otherUserDisplayName}</span>
								<span className="chat-page__thread-meta">
									{c.lastMessagePreview} · {new Date(c.lastMessageAtUtc).toLocaleString()}
									{c.unreadCount > 0 ? ` (${c.unreadCount})` : ''}
								</span>
							</button>
						))}
					</div>
				</aside>

				<main className="chat-page__main">
					<div className="chat-page__header">
						<span
							className={`chat-page__status chat-page__status--${connectionState.toLowerCase()}`}
						>
							{statusLabel}
						</span>
						{connectionState === 'Disconnected' && (
							<Button type="button" variant="outline" onClick={() => void handleReconnect()}>
								{t('common.retry')}
							</Button>
						)}
					</div>

					{selectedUserId == null ? (
						<p className="chat-page__empty-main">{t('pages.userChat.emptySelection')}</p>
					) : (
						<div className="chat-page__conversation">
							<div className="chat-page__header" style={{ borderBottom: '1px solid #dee2e6' }}>
								<div>
									<strong>{threadDisplayName || t('common.loading')}</strong>
									<div className="chat-page__thread-meta">{selectedUserId}</div>
									{showThreadEmail && <div className="chat-page__thread-meta">{threadEmail}</div>}
								</div>
								<Link to={getLocalizedPath(`/users/${selectedUserId}`)}>
									{t('pages.userChat.viewUserDetail')}
								</Link>
							</div>
							{targetUserDetail?.badges.isGloballyBanned && (
								<div
									className="chat-page__model-banner chat-page__model-banner--error"
									role="status"
								>
									{t('pages.userChat.targetGloballyBanned')}
								</div>
							)}
							<div className="chat-page__messages">
								{hasMore && (
									<button
										type="button"
										className="chat-page__load-older"
										onClick={() => void handleLoadOlder()}
										disabled={loadingOlder}
									>
										{loadingOlder ? t('pages.userChat.loading') : t('pages.userChat.loadOlder')}
									</button>
								)}
								{messages.length === 0 && (messagesLoading || messagesFetching) && (
									<p className="chat-page__empty">{t('pages.userChat.loading')}</p>
								)}
								{messages.length === 0 && !messagesLoading && !messagesFetching && (
									<p className="chat-page__empty">{t('pages.userChat.emptyThread')}</p>
								)}
								{messages.map((msg) => {
									const isMe = msg.senderId === user?.id;
									return (
										<div
											key={msg.id}
											className={`chat-page__message chat-page__message--${isMe ? 'user' : 'ai'}`}
										>
											<div className="chat-page__message-header">
												{msg.senderName}
												{msg.isPlatformAdministrator && (
													<span> · {t('pages.userChat.platformBadge')}</span>
												)}
												<span> · {new Date(msg.sentAt).toLocaleString()}</span>
											</div>
											<div className="chat-page__message-content">{msg.content}</div>
										</div>
									);
								})}
								<div ref={messagesEndRef} />
							</div>
							<div className="chat-page__input-row">
								<textarea
									className="chat-page__input"
									rows={2}
									placeholder={t('pages.userChat.composerPlaceholder')}
									value={input}
									onChange={(e) => setInput(e.target.value)}
									maxLength={MAX_MESSAGE_LENGTH}
									disabled={connectionState !== 'Connected'}
								/>
								<Button
									type="button"
									onClick={() => void handleSend()}
									disabled={!input.trim() || connectionState !== 'Connected'}
									className="chat-page__send"
								>
									{t('pages.userChat.send')}
								</Button>
							</div>
							<p className="chat-page__sidebar-hint">
								{t('pages.userChat.charCount', { count: input.length, max: MAX_MESSAGE_LENGTH })}
							</p>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
