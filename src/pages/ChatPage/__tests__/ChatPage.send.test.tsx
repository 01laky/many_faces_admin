// @vitest-environment happy-dom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ChatPage } from '../ChatPage';

// The global setup mock (src/test/setup.ts) pins react-router-dom's useLocation, which would make the
// real useSearchParams read an empty query. Pin useSearchParams here so the active conversation is 5.
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => vi.fn(),
		useSearchParams: () => [new URLSearchParams('c=5'), vi.fn()],
	};
});

/**
 * RAG retrieval refactor v1 regression: the operator chat send path must invoke the SignalR hub
 * with ONLY `(conversationId, message)` — no stats mode and no response locale (D10/D11).
 */

// --- fake SignalR connection so we can inspect `invoke` args ---
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

describe('ChatPage send path', () => {
	beforeEach(() => {
		invokeMock.mockClear();
	});

	it('invokes SendToAiWithOperatorStats with only (conversationId, message)', async () => {
		renderChat();

		// Wait for the hub to "connect" so the input + send button enable.
		const input = await screen.findByPlaceholderText('pages.chat.placeholder');
		await waitFor(() => expect(input).not.toBeDisabled());

		fireEvent.change(input, { target: { value: 'how many albums are pending?' } });
		fireEvent.click(screen.getByRole('button', { name: 'pages.chat.send' }));

		await waitFor(() => expect(invokeMock).toHaveBeenCalled());
		const callArgs = invokeMock.mock.calls[0];
		expect(callArgs[0]).toBe('SendToAiWithOperatorStats');
		expect(callArgs[1]).toBe(5);
		expect(callArgs[2]).toBe('how many albums are pending?');
		// No stats mode, no response locale, no parallel arg — exactly two payload args.
		expect(callArgs).toHaveLength(3);
	});
});
