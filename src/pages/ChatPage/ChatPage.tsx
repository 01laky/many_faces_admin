import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { buildAdminAiChatHubConnection } from '@/api/signalr/buildAdminAiChatHubConnection';
import { resolveHubAccessToken } from '@/utils/authStorage';
import type { InfiniteData } from '@tanstack/react-query';
import {
	useCreateOperatorAiConversation,
	useDeleteOperatorAiConversation,
	useOperatorAiConversations,
	useOperatorAiMessagesInfinite,
	useOperatorAiModelStatus,
	useOperatorAiSystemSettings,
	operatorAiConversationsQueryKey,
	operatorAiModelStatusQueryKey,
	operatorAiQueryKeys,
	patchOperatorAiInfiniteFirstPage,
	type OperatorAiConversationListItem,
	type OperatorAiMessageAppendedEvent,
	type OperatorAiMessagesPage,
} from '@/hooks/api/useOperatorAiApi';
import {
	appendExchangeToMessagesPage,
	conversationTitle,
	mapPageToUiMessages,
	filterTransientStatusExchanges,
	formatOperatorAiModelLabel,
	isOperatorAiEphemeralReply,
	mergeMessagePages,
	parseConversationIdFromSearch,
	truncateThreadTitle,
	type UiChatMessage,
} from '@/utils/operatorAiChatUtils';
import { mapOperatorAiHubError } from '@/utils/operatorAiHubErrors';
import { formatMessageHeader } from '@/utils/operatorAiLocale';
import { Button } from '@/components/radix/Button';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import './ChatPage.scss';
import type { ConnectionState } from './types';
import { SEND_TIMEOUT_MS } from './constants';

export function ChatPage() {
	const { t, i18n } = useTranslation('common');
	const { token, isAuthenticated, user } = useAuth();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [searchParams, setSearchParams] = useSearchParams();
	const conversationId = parseConversationIdFromSearch(searchParams.toString());

	const { data: operatorAiSys, isLoading: operatorAiSysLoading } = useOperatorAiSystemSettings();
	const operatorAiGloballyEnabled = operatorAiSys?.aiEnabled === true;

	useEffect(() => {
		if (operatorAiSysLoading || !token) return;
		if (!operatorAiGloballyEnabled) {
			navigate(`${getLocalizedPath('/settings')}#settings-ai-master`, { replace: true });
		}
	}, [operatorAiSysLoading, token, operatorAiGloballyEnabled, navigate, getLocalizedPath]);

	const { data: conversations = [], isLoading: listLoading } = useOperatorAiConversations();
	const { data: modelStatus } = useOperatorAiModelStatus(operatorAiGloballyEnabled);
	const {
		data: infiniteMessages,
		isLoading: messagesLoading,
		isFetching: messagesFetching,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useOperatorAiMessagesInfinite(conversationId, conversationId != null);
	const modelReady = modelStatus?.ready === true;
	const modelUnavailable = modelStatus?.unavailable === true;
	const modelLoading =
		!modelUnavailable && !modelReady && (modelStatus == null || modelStatus.loading !== false);
	const createConversation = useCreateOperatorAiConversation();
	const deleteConversation = useDeleteOperatorAiConversation();
	const { confirm, ConfirmModalHost } = useConfirmModal();

	const { serverMessages, hasMore } = useMemo(() => {
		const pages = infiniteMessages?.pages ?? [];
		const first = pages[0];
		let older: UiChatMessage[] = [];
		for (let i = 1; i < pages.length; i++) {
			older = mergeMessagePages(mapPageToUiMessages(pages[i].items), older);
		}
		const latest = first ? mapPageToUiMessages(first.items) : [];
		return {
			serverMessages: filterTransientStatusExchanges(mergeMessagePages(latest, older)),
			hasMore: hasNextPage ?? first?.hasMore ?? false,
		};
	}, [infiniteMessages, hasNextPage]);
	const [pendingByConv, setPendingByConv] = useState<Record<number, UiChatMessage[]>>({});
	// Live token-streaming buffer: conversationId → accumulated assistant text built up from incremental
	// "OperatorAiMessageDelta" hub events that arrive DURING generation. This is purely transient and is
	// cleared the moment the authoritative "OperatorAiMessageAppended" terminal event lands (the persisted
	// assistant message then replaces the streamed text with no flicker). If a backend never emits deltas
	// (streaming disabled / older server) this map simply stays empty and the legacy spinner path is used.
	const [streamingByConv, setStreamingByConv] = useState<Record<number, string>>({});
	const loadingOlder = isFetchingNextPage;
	const [input, setInput] = useState('');
	const [connectionState, setConnectionState] = useState<ConnectionState>('Disconnected');
	const [isSending, setIsSending] = useState(false);
	const [sendingElapsedSec, setSendingElapsedSec] = useState(0);

	const connectionRef = useRef<HubConnection | null>(null);
	const hubStartInFlightRef = useRef(false);
	const tokenRef = useRef(token);
	useEffect(() => {
		tokenRef.current = token;
	}, [token]);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const conversationIdRef = useRef(conversationId);
	useEffect(() => {
		conversationIdRef.current = conversationId;
	}, [conversationId]);

	const messages = useMemo(() => {
		const pendingTail = conversationId != null ? (pendingByConv[conversationId] ?? []) : [];
		const ids = new Set(serverMessages.map((m) => m.id));
		const tail = pendingTail.filter((m) => !ids.has(m.id));
		return [...serverMessages, ...tail];
	}, [serverMessages, pendingByConv, conversationId]);

	// Accumulated streaming text for the currently open conversation (empty when no deltas have arrived).
	const streamingText = conversationId != null ? (streamingByConv[conversationId] ?? '') : '';

	const conversationsKey = operatorAiConversationsQueryKey;
	const { messagesKey } = operatorAiQueryKeys();

	useEffect(() => {
		if (conversationId == null) return;
		void queryClient.invalidateQueries({ queryKey: messagesKey(conversationId) });
	}, [conversationId, queryClient, messagesKey]);

	const setActiveConversationId = useCallback(
		(id: number | null) => {
			if (id == null) {
				setSearchParams({});
				return;
			}
			setPendingByConv((map) => {
				if (!(id in map)) return map;
				const next = { ...map };
				delete next[id];
				return next;
			});
			// Drop any stale streaming buffer for the thread being opened so half-streamed text from a
			// previous turn never re-appears when navigating back into a conversation.
			setStreamingByConv((map) => {
				if (!(id in map)) return map;
				const next = { ...map };
				delete next[id];
				return next;
			});
			void queryClient.invalidateQueries({ queryKey: messagesKey(id) });
			setSearchParams({ c: String(id) });
		},
		[setSearchParams, queryClient, messagesKey]
	);

	const refreshConversationList = useCallback(
		(item?: OperatorAiConversationListItem) => {
			if (item) {
				queryClient.setQueryData<OperatorAiConversationListItem[]>(conversationsKey, (prev) => {
					const rest = (prev ?? []).filter((c) => c.id !== item.id);
					return [item, ...rest].sort(
						(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
					);
				});
				return;
			}
			void queryClient.invalidateQueries({ queryKey: conversationsKey });
		},
		[queryClient, conversationsKey]
	);

	const refreshConversationListRef = useRef(refreshConversationList);
	const setActiveConversationIdRef = useRef(setActiveConversationId);
	const queryClientRef = useRef(queryClient);
	useEffect(() => {
		refreshConversationListRef.current = refreshConversationList;
		setActiveConversationIdRef.current = setActiveConversationId;
		queryClientRef.current = queryClient;
	});

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom, isSending]);

	useEffect(() => {
		if (!isSending) return;
		const timer = window.setInterval(() => {
			setSendingElapsedSec((n) => n + 1);
		}, 1000);
		return () => clearInterval(timer);
	}, [isSending]);

	useEffect(() => {
		if (operatorAiSysLoading || !operatorAiGloballyEnabled) {
			hubStartInFlightRef.current = false;
			return;
		}

		if (!isAuthenticated || !token) {
			hubStartInFlightRef.current = false;
			return;
		}

		const getAccessToken = () => resolveHubAccessToken(tokenRef.current);
		const connection = buildAdminAiChatHubConnection(getAccessToken);
		connectionRef.current = connection;
		let cancelled = false;

		connection.on(
			'ReceiveAiMessage',
			(userMessage: string, aiResponse: string, hubErrorCode?: string | null) => {
				const cid = conversationIdRef.current;
				if (cid == null) return;
				// Persisted turns are applied via OperatorAiMessageAppended + React Query cache.
				if (!isOperatorAiEphemeralReply(aiResponse, hubErrorCode)) return;

				const aiContent =
					mapOperatorAiHubError(t, hubErrorCode) || aiResponse || t('pages.chat.errorGeneric');

				setPendingByConv((map) => ({
					...map,
					[cid]: [
						{
							id: -Date.now(),
							role: 'user',
							content: userMessage,
							authorEmail: user?.email,
							createdAt: new Date().toISOString(),
						},
						{ id: -Date.now() - 1, role: 'ai', content: aiContent },
					],
				}));
				void queryClientRef.current.invalidateQueries({
					queryKey: operatorAiModelStatusQueryKey,
				});
				setIsSending(false);
			}
		);

		// Live token streaming: incremental assistant tokens arrive in order during one turn. We append
		// each `delta` to the per-conversation buffer; the active thread re-renders a transient assistant
		// bubble showing the running text. This is advisory/UX only — the persisted message still arrives
		// via OperatorAiMessageAppended, which clears this buffer. Deltas for non-active conversations are
		// still accumulated (so a background thread shows its full streamed text on switch), but only the
		// active conversation's buffer is rendered.
		connection.on('OperatorAiMessageDelta', (evt: { conversationId: number; delta: string }) => {
			if (evt == null || typeof evt.conversationId !== 'number' || typeof evt.delta !== 'string') {
				return;
			}
			setStreamingByConv((map) => ({
				...map,
				[evt.conversationId]: (map[evt.conversationId] ?? '') + evt.delta,
			}));
		});

		connection.on('OperatorAiMessageAppended', (evt: OperatorAiMessageAppendedEvent) => {
			refreshConversationListRef.current(evt.conversation);
			const cid = conversationIdRef.current;
			if (evt.conversationId !== cid || cid == null) return;

			const key = [...messagesKey(cid), 'infinite'] as const;
			queryClientRef.current.setQueryData<InfiniteData<OperatorAiMessagesPage>>(key, (old) =>
				patchOperatorAiInfiniteFirstPage(old, (page) =>
					appendExchangeToMessagesPage(page, evt.userMessage, evt.assistantMessage)
				)
			);
			void queryClientRef.current.invalidateQueries({ queryKey: messagesKey(cid) });

			setPendingByConv((map) => {
				if (!(cid in map)) return map;
				const next = { ...map };
				delete next[cid];
				return next;
			});
			// Terminal event is authoritative: drop the transient streaming buffer so the persisted
			// assistantMessage replaces the streamed text with no duplicate/flicker.
			setStreamingByConv((map) => {
				if (!(cid in map)) return map;
				const next = { ...map };
				delete next[cid];
				return next;
			});
			setIsSending(false);
		});

		connection.on('OperatorAiConversationListChanged', (item: OperatorAiConversationListItem) => {
			refreshConversationListRef.current(item);
		});

		connection.on('OperatorAiConversationDeleted', (evt: { conversationId: number }) => {
			queryClientRef.current.setQueryData<OperatorAiConversationListItem[]>(
				conversationsKey,
				(prev) => (prev ? prev.filter((c) => c.id !== evt.conversationId) : [])
			);
			// Discard any streaming buffer for the removed thread so stale text can never resurface.
			setStreamingByConv((map) => {
				if (!(evt.conversationId in map)) return map;
				const next = { ...map };
				delete next[evt.conversationId];
				return next;
			});
			if (evt.conversationId === conversationIdRef.current) {
				setActiveConversationIdRef.current(null);
			}
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
				console.error('SignalR chat hub connect failed:', err);
				if (!cancelled) setConnectionState('Disconnected');
			} finally {
				hubStartInFlightRef.current = false;
			}
		};

		void startHub();

		return () => {
			cancelled = true;
			hubStartInFlightRef.current = false;
			void connection.stop();
			connectionRef.current = null;
			setConnectionState('Disconnected');
			setIsSending(false);
			// Drop all streaming buffers when the hub tears down so no stale streamed text survives a
			// remount/reconnect cycle.
			setStreamingByConv({});
		};
		// token read via tokenRef — omit from deps to avoid hub reconnect loop on refresh
		// eslint-disable-next-line react-hooks/exhaustive-deps -- messagesKey stable; hub lifetime tied to auth + conversation list key
	}, [isAuthenticated, conversationsKey, operatorAiSysLoading, operatorAiGloballyEnabled, token]);

	const handleLoadOlder = async () => {
		if (conversationId == null || loadingOlder || !hasMore) return;
		const el = messagesContainerRef.current;
		const prevHeight = el?.scrollHeight ?? 0;
		await fetchNextPage();
		requestAnimationFrame(() => {
			if (el) el.scrollTop = el.scrollHeight - prevHeight;
		});
	};

	const handleMessagesScroll = () => {
		const el = messagesContainerRef.current;
		if (!el || loadingOlder || !hasMore) return;
		if (el.scrollTop <= 48) void handleLoadOlder();
	};

	const handleNewChat = async () => {
		const created = await createConversation.mutateAsync();
		setActiveConversationId(created.id);
	};

	const handleDelete = async () => {
		if (conversationId == null) return;
		const confirmed = await confirm({
			title: t('pages.chat.deleteChat'),
			message: t('pages.chat.confirmDelete'),
			confirmVariant: 'danger',
		});
		if (!confirmed) return;
		await deleteConversation.mutateAsync(conversationId);
		setActiveConversationId(null);
	};

	const handleSend = async () => {
		const text = input.trim();
		if (
			!text ||
			isSending ||
			connectionState !== 'Connected' ||
			conversationId == null ||
			!modelReady
		)
			return;

		const conn = connectionRef.current;
		if (!conn) return;

		setInput('');
		const optimisticUserId = -Date.now();
		setSendingElapsedSec(0);
		setIsSending(true);
		setPendingByConv((map) => ({
			...map,
			[conversationId]: [
				{
					id: optimisticUserId,
					role: 'user',
					content: text,
					authorEmail: user?.email,
					createdAt: new Date().toISOString(),
				},
			],
		}));
		try {
			// RAG retrieval refactor v1: the operator chat is always data-grounded (D11) and the AI is
			// locale-free (D10). The SignalR send no longer passes a stats mode or a response locale —
			// the backend orchestrator selects bundles (retrieve → map → stitch) entirely server-side.
			await Promise.race([
				conn.invoke('SendToAiWithOperatorStats', conversationId, text),
				new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), SEND_TIMEOUT_MS)),
			]);
		} catch (err) {
			setIsSending(false);
			const aiContent = String(err).includes('timeout')
				? t('pages.chat.timeoutError')
				: t('pages.chat.errorGeneric');
			setPendingByConv((map) => ({
				...map,
				[conversationId]: [
					{ id: optimisticUserId, role: 'user', content: text },
					{ id: optimisticUserId - 1, role: 'ai', content: aiContent },
				],
			}));
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			void handleSend();
		}
	};

	const statusLabel =
		connectionState === 'Connecting'
			? t('pages.chat.connecting')
			: connectionState === 'Connected'
				? t('pages.chat.connected')
				: connectionState === 'Reconnecting'
					? t('pages.chat.connecting')
					: t('pages.chat.disconnected');

	const modelShortName = formatOperatorAiModelLabel(modelStatus?.modelName);
	const modelStatusKind = modelUnavailable
		? 'unavailable'
		: modelLoading
			? 'loading'
			: modelReady
				? 'ready'
				: 'unknown';
	const modelStatusLabel =
		modelStatusKind === 'ready'
			? t('pages.chat.modelStatusReady', { model: modelShortName || 'AI' })
			: modelStatusKind === 'loading'
				? t('pages.chat.modelStatusLoading')
				: modelStatusKind === 'unavailable'
					? t('pages.chat.modelStatusUnavailable')
					: t('pages.chat.modelStatusUnknown');

	const unnamed = t('pages.chat.unnamedThread');

	if (operatorAiSysLoading) {
		return (
			<div className="chat-page-shell" role="status" aria-busy>
				<p className="chat-page__empty-main">{t('pages.chat.loadingOlder')}</p>
			</div>
		);
	}
	if (!operatorAiGloballyEnabled) {
		return null;
	}

	return (
		<div className="chat-page-shell">
			{ConfirmModalHost}
			<div className="chat-page">
				<aside className="chat-page__sidebar">
					<div className="chat-page__sidebar-header">
						<h1 className="chat-page__title">{t('pages.chat.title')}</h1>
						<Button
							type="button"
							size="sm"
							onClick={() => void handleNewChat()}
							disabled={createConversation.isPending}
						>
							{t('pages.chat.newChat')}
						</Button>
					</div>
					<div className="chat-page__thread-list">
						{listLoading && (
							<p className="chat-page__sidebar-hint">{t('pages.chat.loadingOlder')}</p>
						)}
						{!listLoading && conversations.length === 0 && (
							<p className="chat-page__sidebar-hint">{t('pages.chat.sidebarEmpty')}</p>
						)}
						{conversations.map((c) => {
							// First message becomes the title; truncate the displayed text to keep the sidebar
							// width stable, and expose the full title via the row tooltip.
							const fullTitle = conversationTitle(c.title, unnamed);
							return (
								<button
									key={c.id}
									type="button"
									className={`chat-page__thread${c.id === conversationId ? ' chat-page__thread--active' : ''}`}
									onClick={() => setActiveConversationId(c.id)}
									title={fullTitle}
								>
									<span className="chat-page__thread-title">{truncateThreadTitle(fullTitle)}</span>
									<span className="chat-page__thread-meta">
										{new Date(c.updatedAt).toLocaleString()}
									</span>
								</button>
							);
						})}
					</div>
				</aside>

				<main className="chat-page__main">
					<div className="chat-page__header">
						<div className="chat-page__header-statuses">
							<span
								className={`chat-page__status chat-page__status--${connectionState.toLowerCase()}`}
								title={connectionState}
							>
								{statusLabel}
							</span>
							<span
								className={`chat-page__model-status chat-page__model-status--${modelStatusKind}`}
								title={modelStatus?.modelName ?? undefined}
							>
								{modelStatusLabel}
							</span>
						</div>
						{conversationId != null && (
							<Button
								type="button"
								size="sm"
								onClick={() => void handleDelete()}
								disabled={deleteConversation.isPending}
							>
								{t('pages.chat.deleteChat')}
							</Button>
						)}
					</div>

					{conversationId == null ? (
						<p className="chat-page__empty-main">{t('pages.chat.selectOrNew')}</p>
					) : (
						<div className="chat-page__conversation">
							{(modelLoading || modelUnavailable) && (
								<div
									className={`chat-page__model-banner${
										modelUnavailable ? ' chat-page__model-banner--error' : ''
									}`}
									role="status"
								>
									{modelUnavailable
										? t('pages.chat.modelUnavailable')
										: t('pages.chat.modelLoading')}
								</div>
							)}
							<div
								ref={messagesContainerRef}
								className="chat-page__messages"
								onScroll={handleMessagesScroll}
							>
								{hasMore && (
									<button
										type="button"
										className="chat-page__load-older"
										onClick={() => void handleLoadOlder()}
										disabled={loadingOlder || messagesLoading}
									>
										{loadingOlder ? t('pages.chat.loadingOlder') : t('pages.chat.loadOlder')}
									</button>
								)}
								{messages.length === 0 && (messagesLoading || messagesFetching) && !isSending && (
									<p className="chat-page__empty">{t('pages.chat.loadingMessages')}</p>
								)}
								{messages.length === 0 &&
									!messagesLoading &&
									!messagesFetching &&
									!isSending &&
									connectionState === 'Connected' && (
										<p className="chat-page__empty">{t('pages.chat.emptyThread')}</p>
									)}
								{messages.map((msg) => (
									<div
										key={msg.id}
										className={`chat-page__message chat-page__message--${msg.role}`}
									>
										<div className="chat-page__message-header">
											{formatMessageHeader(t, msg, i18n.language)}
										</div>
										<div className="chat-page__message-content">{msg.content}</div>
									</div>
								))}
								{isSending && streamingText !== '' && (
									// Live streaming bubble: once incremental deltas start arriving we show the running
									// assistant text (with a subtle blinking caret) in the standard AI bubble styling,
									// replacing the "waiting" spinner. It is cleared on OperatorAiMessageAppended.
									<div
										className="chat-page__message chat-page__message--ai"
										data-testid="chat-streaming-message"
									>
										<span className="chat-page__message-label">{t('pages.chat.ai')}</span>
										<div className="chat-page__message-content">
											{streamingText}
											<span className="chat-page__streaming-caret" aria-hidden="true" />
										</div>
									</div>
								)}
								{isSending && streamingText === '' && (
									<div className="chat-page__message chat-page__message--ai">
										<span className="chat-page__message-label">{t('pages.chat.ai')}</span>
										<div className="chat-page__message-content chat-page__typing">
											{/* "Thinking" indicator. The label stays a standalone text node and the animated
											    dots are a decorative, no-text sibling, so it reads as the localized word to
											    assistive tech (announced once via role=status) while the dots are purely visual.
											    Only this label line is the live region — the elapsed hint below ticks every
											    second and is intentionally left out so it is not re-announced repeatedly. */}
											<p className="chat-page__typing-line" role="status" aria-live="polite">
												{t('pages.chat.waitingForAi')}
												<span className="chat-page__typing-dots" aria-hidden="true">
													<span />
													<span />
													<span />
												</span>
											</p>
											{sendingElapsedSec > 0 && (
												<p className="chat-page__typing-hint">
													{t('pages.chat.waitingForAiElapsed', {
														seconds: sendingElapsedSec,
													})}
												</p>
											)}
										</div>
									</div>
								)}
								<div ref={messagesEndRef} />
							</div>

							<div className="chat-page__input-row">
								<input
									type="text"
									className="chat-page__input"
									placeholder={
										modelReady
											? t('pages.chat.placeholder')
											: t('pages.chat.modelLoadingPlaceholder')
									}
									value={input}
									onChange={(e) => setInput(e.target.value)}
									onKeyDown={handleKeyDown}
									disabled={connectionState !== 'Connected' || isSending || !modelReady}
								/>
								<Button
									type="button"
									onClick={() => void handleSend()}
									disabled={
										!input.trim() || connectionState !== 'Connected' || isSending || !modelReady
									}
									className="chat-page__send"
								>
									{t('pages.chat.send')}
								</Button>
							</div>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
