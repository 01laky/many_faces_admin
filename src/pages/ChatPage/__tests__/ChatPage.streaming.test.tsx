// @vitest-environment happy-dom
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ChatPage } from '../ChatPage';

// Live token-streaming regression suite. The backend now emits incremental "OperatorAiMessageDelta"
// events DURING generation, then the authoritative "OperatorAiMessageAppended" terminal event. We assert
// the deltas render live, the terminal event reconciles to the persisted message, the legacy
// spinner-only path still works when no deltas arrive, and streaming never leaks across conversations.

// Pin useSearchParams so the active conversation is 5 (mirrors ChatPage.send.test.tsx).
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => vi.fn(),
		useSearchParams: () => [new URLSearchParams('c=5'), vi.fn()],
	};
});

// --- fake SignalR connection: capture the `on(eventName, handler)` registrations so tests can fire
//     hub events (deltas / appended) directly at the component. ---
const invokeMock = vi.fn().mockResolvedValue(undefined);

const fakeConnection = {
	on: vi.fn(),
	onreconnecting: vi.fn(),
	onreconnected: vi.fn(),
	onclose: vi.fn(),
	start: vi.fn().mockResolvedValue(undefined),
	stop: vi.fn().mockResolvedValue(undefined),
	invoke: invokeMock,
};

/** Return the most recently registered handler for a given SignalR event name. */
function handlerFor(event: string): (...args: unknown[]) => void {
	const calls = fakeConnection.on.mock.calls.filter((c) => c[0] === event);
	const last = calls[calls.length - 1];
	if (!last) throw new Error(`No handler registered for "${event}"`);
	return last[1] as (...args: unknown[]) => void;
}

vi.mock('@/api/signalr/buildAdminAiChatHubConnection', () => ({
	buildAdminAiChatHubConnection: () => fakeConnection,
}));

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: () => ({
		token: 'eyJ.test',
		isAuthenticated: true,
		user: { email: 'admin@admin.com' },
	}),
}));

vi.mock('@/utils/authStorage', () => ({
	resolveHubAccessToken: () => 'eyJ.test',
}));

vi.mock('@/hooks/useLocalizedLink', () => ({
	useLocalizedLink: () => (path: string) => `/en${path}`,
}));

vi.mock('@/hooks/useConfirmModal', () => ({
	useConfirmModal: () => ({ confirm: vi.fn().mockResolvedValue(true), ConfirmModalHost: null }),
}));

vi.mock('@/hooks/api/useOperatorAiApi', async () => {
	const actual = await vi.importActual<typeof import('@/hooks/api/useOperatorAiApi')>(
		'@/hooks/api/useOperatorAiApi'
	);
	return {
		...actual,
		useOperatorAiSystemSettings: () => ({ data: { aiEnabled: true }, isLoading: false }),
		useOperatorAiConversations: () => ({
			data: [{ id: 5, title: 'Thread', updatedAt: '2026-06-01T10:00:00.000Z' }],
			isLoading: false,
		}),
		useOperatorAiModelStatus: () => ({ data: { ready: true, unavailable: false, loading: false } }),
		useOperatorAiMessagesInfinite: () => ({
			data: { pages: [{ items: [], hasMore: false }] },
			isLoading: false,
			isFetching: false,
			fetchNextPage: vi.fn(),
			hasNextPage: false,
			isFetchingNextPage: false,
		}),
		useCreateOperatorAiConversation: () => ({ mutateAsync: vi.fn(), isPending: false }),
		useDeleteOperatorAiConversation: () => ({ mutateAsync: vi.fn(), isPending: false }),
	};
});

function renderChat() {
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return render(
		<QueryClientProvider client={client}>
			<ChatPage />
		</QueryClientProvider>
	);
}

/** Render, wait for the hub to "connect", then send a message so the component is in the awaiting-AI state. */
async function renderAndSend() {
	renderChat();
	const input = await screen.findByPlaceholderText('pages.chat.placeholder');
	await waitFor(() => expect(input).not.toBeDisabled());
	fireEvent.change(input, { target: { value: 'how many albums are pending?' } });
	fireEvent.click(screen.getByRole('button', { name: 'pages.chat.send' }));
	await waitFor(() => expect(invokeMock).toHaveBeenCalled());
}

describe('ChatPage live token streaming', () => {
	beforeEach(() => {
		invokeMock.mockClear();
		fakeConnection.on.mockClear();
	});

	it('accumulates delta events and renders the streaming text live', async () => {
		await renderAndSend();

		const onDelta = handlerFor('OperatorAiMessageDelta');
		act(() => {
			onDelta({ conversationId: 5, delta: 'Hello ' });
		});
		act(() => {
			onDelta({ conversationId: 5, delta: 'world' });
		});

		const bubble = await screen.findByTestId('chat-streaming-message');
		expect(bubble.textContent).toContain('Hello world');
		// The legacy "waiting for AI" spinner must be gone once deltas have started.
		expect(screen.queryByText('pages.chat.waitingForAi')).not.toBeInTheDocument();
	});

	it('clears the streaming buffer on OperatorAiMessageAppended so the persisted message replaces it', async () => {
		// The persisted assistant message itself is surfaced through the React Query infinite cache (mocked
		// to static empty data in this harness), so here we assert ChatPage's own responsibility on the
		// terminal event: the transient streaming bubble + its text vanish and the awaiting-AI state clears,
		// leaving no duplicate/flicker for the cache-driven persisted message to slot into.
		await renderAndSend();

		const onDelta = handlerFor('OperatorAiMessageDelta');
		act(() => {
			onDelta({ conversationId: 5, delta: 'Streaming partial answer' });
		});
		expect(await screen.findByTestId('chat-streaming-message')).toBeInTheDocument();

		const onAppended = handlerFor('OperatorAiMessageAppended');
		act(() => {
			onAppended({
				conversationId: 5,
				userMessage: { id: 100, role: 'User', content: 'how many albums are pending?' },
				assistantMessage: { id: 101, role: 'Assistant', content: 'There are 3 pending albums.' },
				conversation: { id: 5, title: 'Thread', updatedAt: '2026-06-01T11:00:00.000Z' },
			});
		});

		// Transient streaming bubble + its text are gone, and the awaiting spinner cleared (isSending = false).
		await waitFor(() => {
			expect(screen.queryByTestId('chat-streaming-message')).not.toBeInTheDocument();
		});
		expect(screen.queryByText('Streaming partial answer')).not.toBeInTheDocument();
		expect(screen.queryByText('pages.chat.waitingForAi')).not.toBeInTheDocument();
	});

	it('falls back to the legacy spinner when no delta events arrive', async () => {
		await renderAndSend();

		// No OperatorAiMessageDelta fired → the awaiting-AI spinner is the only assistant indicator.
		expect(await screen.findByText('pages.chat.waitingForAi')).toBeInTheDocument();
		expect(screen.queryByTestId('chat-streaming-message')).not.toBeInTheDocument();

		const onAppended = handlerFor('OperatorAiMessageAppended');
		act(() => {
			onAppended({
				conversationId: 5,
				userMessage: { id: 100, role: 'User', content: 'how many albums are pending?' },
				assistantMessage: { id: 101, role: 'Assistant', content: 'Legacy non-streamed answer.' },
				conversation: { id: 5, title: 'Thread', updatedAt: '2026-06-01T11:00:00.000Z' },
			});
		});

		// Terminal event clears the awaiting-AI state; no streaming bubble was ever shown on this legacy path.
		await waitFor(() => {
			expect(screen.queryByText('pages.chat.waitingForAi')).not.toBeInTheDocument();
		});
		expect(screen.queryByTestId('chat-streaming-message')).not.toBeInTheDocument();
	});

	it('does not leak deltas from another conversation into the active view', async () => {
		await renderAndSend();

		const onDelta = handlerFor('OperatorAiMessageDelta');
		// Active conversation is 5. A delta for conversation 9 must never render here.
		act(() => {
			onDelta({ conversationId: 9, delta: 'Other-thread secret tokens' });
		});

		// The active thread is still just waiting — nothing from conversation 9 leaked in.
		expect(await screen.findByText('pages.chat.waitingForAi')).toBeInTheDocument();
		expect(screen.queryByTestId('chat-streaming-message')).not.toBeInTheDocument();
		expect(screen.queryByText('Other-thread secret tokens')).not.toBeInTheDocument();
	});
});
