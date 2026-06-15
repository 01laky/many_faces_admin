// @vitest-environment happy-dom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ChatPage } from '../ChatPage';

// Covers the two UX additions: the animated "Thinking" dots in the awaiting-AI bubble, and the
// truncated sidebar thread title (with the full text preserved on the row's `title` tooltip).
// Mocks mirror ChatPage.streaming.test.tsx; the conversation here uses a long title so truncation shows.

const LONG_TITLE = 'Quarterly metrics review and notes'; // 34 chars
const TRUNCATED = 'Quarterly metrics review…'; // first 24 chars + ellipsis

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => vi.fn(),
		useSearchParams: () => [new URLSearchParams('c=5'), vi.fn()],
	};
});

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
	useAuth: () => ({ token: 'eyJ.test', isAuthenticated: true, user: { email: 'admin@admin.com' } }),
}));

vi.mock('@/utils/authStorage', () => ({ resolveHubAccessToken: () => 'eyJ.test' }));

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
			data: [{ id: 5, title: LONG_TITLE, updatedAt: '2026-06-01T10:00:00.000Z' }],
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

describe('ChatPage thinking indicator + thread-title truncation', () => {
	beforeEach(() => {
		invokeMock.mockClear();
		fakeConnection.on.mockClear();
	});

	it('shows the "Thinking" label with animated dots while awaiting a reply', async () => {
		const { container } = renderChat();
		const input = await screen.findByPlaceholderText('pages.chat.placeholder');
		await waitFor(() => expect(input).not.toBeDisabled());
		fireEvent.change(input, { target: { value: 'how many albums are pending?' } });
		fireEvent.click(screen.getByRole('button', { name: 'pages.chat.send' }));
		await waitFor(() => expect(invokeMock).toHaveBeenCalled());

		// Label still present as its own text node (keeps the streaming-suite assertions valid)...
		expect(await screen.findByText('pages.chat.waitingForAi')).toBeInTheDocument();
		// ...and the decorative animated-dots element renders alongside it.
		expect(container.querySelector('.chat-page__typing-dots')).not.toBeNull();
	});

	it('truncates a long sidebar thread title and keeps the full text in the row tooltip', async () => {
		renderChat();
		const titleEl = await screen.findByText(TRUNCATED);
		expect(titleEl).toHaveClass('chat-page__thread-title');
		// Full, untruncated title is preserved on the button's native tooltip.
		expect(screen.getByTitle(LONG_TITLE)).toBeInTheDocument();
		// The full title is not shown verbatim anywhere as visible text.
		expect(screen.queryByText(LONG_TITLE)).not.toBeInTheDocument();
	});
});
