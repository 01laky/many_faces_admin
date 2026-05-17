import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { buildAdminAiChatHubConnection } from '@/api/signalr/buildAdminAiChatHubConnection';
import {
	getOperatorAiMessages,
	type OperatorAiConversationListItem,
	type OperatorAiMessageAppendedEvent,
} from '@/api/services/operatorAiApi';
import {
	useCreateOperatorAiConversation,
	useDeleteOperatorAiConversation,
	useOperatorAiConversations,
	useOperatorAiMessages,
	useOperatorAiModelStatus,
	operatorAiConversationsQueryKey,
	operatorAiModelStatusQueryKey,
	operatorAiQueryKeys,
} from '@/hooks/api/useOperatorAiApi';
import { getAdminAiPublicStatsMode } from '@/utils/adminAiStatsSettings';
import {
	appendExchangeIfNew,
	conversationTitle,
	mapPageToUiMessages,
	filterTransientStatusExchanges,
	isTransientAiStatusContent,
	mergeMessagePages,
	parseConversationIdFromSearch,
	type UiChatMessage,
} from '@/utils/operatorAiChatUtils';
import { Button } from '@/components/radix/Button';
import './ChatPage.scss';

type ConnectionState = 'Connecting' | 'Connected' | 'Disconnected' | 'Reconnecting';

const SEND_TIMEOUT_MS = 360_000;

export function ChatPage() {
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const queryClient = useQueryClient();
	const [searchParams, setSearchParams] = useSearchParams();
	const conversationId = parseConversationIdFromSearch(searchParams.toString());

	const { data: conversations = [], isLoading: listLoading } = useOperatorAiConversations();
	const { data: modelStatus } = useOperatorAiModelStatus();
	const {
		data: messagesPage,
		isLoading: messagesLoading,
		isFetching: messagesFetching,
	} = useOperatorAiMessages(conversationId, conversationId != null);
	const modelReady = modelStatus?.ready === true;
	const modelUnavailable = modelStatus?.unavailable === true;
	const modelLoading =
		!modelUnavailable && !modelReady && (modelStatus == null || modelStatus.loading !== false);
	const createConversation = useCreateOperatorAiConversation();
	const deleteConversation = useDeleteOperatorAiConversation();

	const serverMessages = useMemo(
		() => (messagesPage ? mapPageToUiMessages(messagesPage.items) : []),
		[messagesPage]
	);
	const [olderHasMoreByConv, setOlderHasMoreByConv] = useState<Record<number, boolean>>({});
	const [olderByConv, setOlderByConv] = useState<Record<number, UiChatMessage[]>>({});
	const [pendingByConv, setPendingByConv] = useState<Record<number, UiChatMessage[]>>({});

	const hasMore =
		conversationId != null && conversationId in olderHasMoreByConv
			? olderHasMoreByConv[conversationId]
			: (messagesPage?.hasMore ?? false);
	const [loadingOlder, setLoadingOlder] = useState(false);
	const [input, setInput] = useState('');
	const [connectionState, setConnectionState] = useState<ConnectionState>('Disconnected');
	const [isSending, setIsSending] = useState(false);

	const connectionRef = useRef<HubConnection | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const conversationIdRef = useRef(conversationId);
	useEffect(() => {
		conversationIdRef.current = conversationId;
	}, [conversationId]);

	const messages = useMemo(() => {
		const olderMessages = conversationId != null ? (olderByConv[conversationId] ?? []) : [];
		const pendingTail = conversationId != null ? (pendingByConv[conversationId] ?? []) : [];
		const merged = filterTransientStatusExchanges(mergeMessagePages(serverMessages, olderMessages));
		const ids = new Set(merged.map((m) => m.id));
		const tail = pendingTail.filter((m) => !ids.has(m.id));
		return [...merged, ...tail];
	}, [serverMessages, olderByConv, pendingByConv, conversationId]);

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
		if (!token) return;

		const connection = buildAdminAiChatHubConnection(token);
		connectionRef.current = connection;

		connection.on('ReceiveAiMessage', (userMessage: string, aiResponse: string) => {
			const cid = conversationIdRef.current;
			if (cid == null) return;
			if (isTransientAiStatusContent(aiResponse)) {
				setPendingByConv((map) => ({
					...map,
					[cid]: [{ id: -Date.now(), role: 'user', content: userMessage }],
				}));
				void queryClientRef.current.invalidateQueries({
					queryKey: operatorAiModelStatusQueryKey,
				});
				setIsSending(false);
				return;
			}
			setPendingByConv((map) => ({
				...map,
				[cid]: [
					{ id: -Date.now(), role: 'user', content: userMessage },
					{ id: -Date.now() - 1, role: 'ai', content: aiResponse },
				],
			}));
			setIsSending(false);
		});

		connection.on('OperatorAiMessageAppended', (evt: OperatorAiMessageAppendedEvent) => {
			refreshConversationListRef.current(evt.conversation);
			const cid = conversationIdRef.current;
			if (evt.conversationId !== cid || cid == null) return;
			setPendingByConv((map) => {
				const persisted = (map[cid] ?? []).filter((m) => m.id > 0);
				return {
					...map,
					[cid]: appendExchangeIfNew(persisted, evt.userMessage, evt.assistantMessage),
				};
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
			if (evt.conversationId === conversationIdRef.current) {
				setActiveConversationIdRef.current(null);
			}
		});

		connection.onreconnecting(() => setConnectionState('Reconnecting'));
		connection.onreconnected(() => setConnectionState('Connected'));
		connection.onclose(() => setConnectionState('Disconnected'));

		queueMicrotask(() => setConnectionState('Connecting'));
		void connection
			.start()
			.then(() => setConnectionState('Connected'))
			.catch((err) => {
				console.error('SignalR chat hub connect failed:', err);
				setConnectionState('Disconnected');
			});

		return () => {
			void connection.stop();
			connectionRef.current = null;
			setConnectionState('Disconnected');
			setIsSending(false);
		};
	}, [token, conversationsKey]);

	const handleLoadOlder = async () => {
		if (!token || conversationId == null || loadingOlder || !hasMore || messages.length === 0)
			return;
		const beforeId = messages[0]?.id;
		if (!beforeId || beforeId < 1) return;

		const el = messagesContainerRef.current;
		const prevHeight = el?.scrollHeight ?? 0;

		setLoadingOlder(true);
		try {
			const page = await getOperatorAiMessages(token, conversationId, { beforeId });
			setOlderByConv((map) => ({
				...map,
				[conversationId]: mergeMessagePages(
					mapPageToUiMessages(page.items),
					map[conversationId] ?? []
				),
			}));
			setOlderHasMoreByConv((map) => ({ ...map, [conversationId]: page.hasMore }));
			requestAnimationFrame(() => {
				if (el) el.scrollTop = el.scrollHeight - prevHeight;
			});
		} finally {
			setLoadingOlder(false);
		}
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
		if (!window.confirm(t('pages.chat.confirmDelete'))) return;
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
		setPendingByConv((map) => ({
			...map,
			[conversationId]: [
				...(map[conversationId] ?? []).filter((m) => m.id > 0),
				{ id: optimisticUserId, role: 'user', content: text },
			],
		}));
		setIsSending(true);
		const statsMode = getAdminAiPublicStatsMode();
		try {
			await Promise.race([
				conn.invoke('SendToAiWithOperatorStats', conversationId, text, statsMode),
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

	const unnamed = t('pages.chat.unnamedThread');

	return (
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
					{listLoading && <p className="chat-page__sidebar-hint">{t('pages.chat.loadingOlder')}</p>}
					{!listLoading && conversations.length === 0 && (
						<p className="chat-page__sidebar-hint">{t('pages.chat.sidebarEmpty')}</p>
					)}
					{conversations.map((c) => (
						<button
							key={c.id}
							type="button"
							className={`chat-page__thread${c.id === conversationId ? ' chat-page__thread--active' : ''}`}
							onClick={() => setActiveConversationId(c.id)}
						>
							<span className="chat-page__thread-title">{conversationTitle(c.title, unnamed)}</span>
							<span className="chat-page__thread-meta">
								{new Date(c.updatedAt).toLocaleString()}
							</span>
						</button>
					))}
				</div>
			</aside>

			<main className="chat-page__main">
				<div className="chat-page__header">
					<span
						className={`chat-page__status chat-page__status--${connectionState.toLowerCase()}`}
						title={connectionState}
					>
						{statusLabel}
					</span>
					{conversationId != null && (
						<Button type="button" size="sm" onClick={() => void handleDelete()}>
							{t('pages.chat.deleteChat')}
						</Button>
					)}
				</div>

				{conversationId == null ? (
					<p className="chat-page__empty-main">{t('pages.chat.selectOrNew')}</p>
				) : (
					<>
						{(modelLoading || modelUnavailable) && (
							<div
								className={`chat-page__model-banner${
									modelUnavailable ? ' chat-page__model-banner--error' : ''
								}`}
								role="status"
							>
								{modelUnavailable ? t('pages.chat.modelUnavailable') : t('pages.chat.modelLoading')}
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
								<div key={msg.id} className={`chat-page__message chat-page__message--${msg.role}`}>
									<span className="chat-page__message-label">
										{msg.role === 'user' ? t('pages.chat.you') : t('pages.chat.ai')}
									</span>
									<div className="chat-page__message-content">{msg.content}</div>
								</div>
							))}
							{isSending && (
								<div className="chat-page__message chat-page__message--ai">
									<span className="chat-page__message-label">{t('pages.chat.ai')}</span>
									<div className="chat-page__message-content chat-page__typing">
										{t('pages.chat.waitingForAi')}
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
									modelReady ? t('pages.chat.placeholder') : t('pages.chat.modelLoadingPlaceholder')
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
					</>
				)}
			</main>
		</div>
	);
}
