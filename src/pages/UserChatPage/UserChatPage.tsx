/**
 * Super-admin two-pane inbox: conversation list + real-time thread with end users.
 * Uses REST for history/pagination and MessengerHub SendPlatformDirectMessage for sends.
 * Deep link: /{lang}/user-chat?u={userId} (localized slug via routeTranslations).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { buildAdminMessengerHubConnection } from '@/api/signalr/buildAdminMessengerHubConnection';
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
import { appendUserChatMessage, type UiUserChatMessage } from '@/utils/userChatMessageMerge';
import { isSuperAdminFromToken } from '@/utils/contentModeration';
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
	const hubStartInFlightRef = useRef(false);
	const tokenRef = useRef(token);
	const selectedUserIdRef = useRef(selectedUserId);
	const userIdRef = useRef(user?.id);
	const messagesEndRef = useRef<HTMLDivElement>(null);

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
		if (!isAuthenticated || !token || !isSuperAdminFromToken(token)) return;

		const getAccessToken = () => tokenRef.current ?? localStorage.getItem('auth_token');
		const connection = buildAdminMessengerHubConnection(getAccessToken);
		connectionRef.current = connection;
		let cancelled = false;

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

				if (senderId === target) {
					const key = [...operatorUserChatMessagesKey(target), 'infinite'] as const;
					queryClient.setQueryData<InfiniteData<OperatorUserChatHistoryPage>>(key, (old) =>
						patchOperatorUserChatInfiniteFirstPage(old, (page) => ({
							...page,
							items: appendUserChatMessage(page.items, msg),
						}))
					);
				}
				setPending((prev) => appendUserChatMessage(prev, msg));
				void queryClient.invalidateQueries({ queryKey: operatorUserChatConversationsKey });
			}
		);

		connection.on('ReceivePlatformChatError', (code: string) => {
			toast.error(mapOperatorUserChatHubError(t, code));
		});

		connection.onreconnecting(() => setConnectionState('Reconnecting'));
		connection.onreconnected(() => setConnectionState('Connected'));
		connection.onclose(() => setConnectionState('Disconnected'));

		const startHub = async () => {
			if (hubStartInFlightRef.current) return;
			hubStartInFlightRef.current = true;
			setConnectionState('Connecting');
			try {
				await connection.start();
				if (!cancelled) setConnectionState('Connected');
			} catch (err) {
				console.error('Messenger hub connect failed:', err);
				if (!cancelled) setConnectionState('Disconnected');
			} finally {
				hubStartInFlightRef.current = false;
			}
		};

		void startHub();

		const onVisible = () => {
			if (document.visibilityState !== 'visible') return;
			void queryClient.invalidateQueries({ queryKey: operatorUserChatConversationsKey });
			const tid = selectedUserIdRef.current;
			if (tid) void queryClient.invalidateQueries({ queryKey: operatorUserChatMessagesKey(tid) });
		};
		document.addEventListener('visibilitychange', onVisible);

		return () => {
			cancelled = true;
			document.removeEventListener('visibilitychange', onVisible);
			hubStartInFlightRef.current = false;
			void connection.stop();
			connectionRef.current = null;
			setConnectionState('Disconnected');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- token via ref; hub lifetime tied to auth
	}, [isAuthenticated, queryClient, t]);

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
			setPending([]);
			void queryClient.invalidateQueries({ queryKey: operatorUserChatMessagesKey(selectedUserId) });
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
					</div>

					{selectedUserId == null ? (
						<p className="chat-page__empty-main">{t('pages.userChat.emptySelection')}</p>
					) : (
						<div className="chat-page__conversation">
							<div className="chat-page__header" style={{ borderBottom: '1px solid #dee2e6' }}>
								<div>
									<strong>{selectedConversation?.otherUserDisplayName ?? selectedUserId}</strong>
									<div className="chat-page__thread-meta">
										{selectedConversation?.otherUserEmail}
									</div>
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
