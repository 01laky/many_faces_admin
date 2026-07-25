// @vitest-environment happy-dom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReelDetailPage } from '../ReelDetailPage';
import type { ReelDetail } from '@/hooks/api/useReelsApi/types';

/**
 * Page-level coverage for admin-reel-detail-moderation-agent-prompt.md §10.1:
 *  - RDM-U3 moderation card hidden for a non–super-admin token
 *  - RDM-U4 "Open chat" navigates to the localized user-chat deep link
 *  - RDM-U7 Approve opens the override dialog when AI recommended reject (no mutation yet)
 *  - RDM-U8 Template B cards render in order with their testids
 *  - RDM-U9 the preview modal is mounted with `showDelete={false}`
 *
 * The generated OpenAPI client is never touched directly: the page reads through
 * `@/hooks/api/useReelsApi`, so that module is mocked with fixture data the way the
 * other admin page tests (SettingsPage, ChatPage, AdminProfilePage) do it.
 */

const hoisted = vi.hoisted(() => ({
	navigate: vi.fn(),
	previewProps: [] as Array<{ show: boolean; showDelete?: boolean }>,
	moderationMutate: vi.fn().mockResolvedValue(undefined),
	deleteMutate: vi.fn().mockResolvedValue(undefined),
	reelQuery: {
		data: undefined as ReelDetail | undefined,
		isLoading: false,
		isError: false,
		error: null as unknown,
		refetch: vi.fn().mockResolvedValue(undefined),
	},
}));

// The global setup mock pins useParams/useLocation; re-pin the router hooks this page actually
// reads so the reel id comes from the path and faceId from the query string.
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => hoisted.navigate,
		useParams: () => ({ id: '42' }),
		useSearchParams: () => [new URLSearchParams('faceId=7'), vi.fn()],
	};
});

vi.mock('@/hooks/useLocalizedLink', () => ({
	useLocalizedLink: () => (path: string) => `/en/${path.replace(/^\//, '')}`,
}));

vi.mock('@/hooks/api/useReelsApi', () => ({
	useReel: () => hoisted.reelQuery,
	useDeleteReel: () => ({ mutateAsync: hoisted.deleteMutate, isPending: false }),
	useReelModerationAction: () => ({ mutateAsync: hoisted.moderationMutate, isPending: false }),
}));

// Stub the preview modal so RDM-U9 can assert the props the page passes to it.
vi.mock('@/components/ContentMediaPreviewModal/ContentMediaPreviewModal', () => ({
	ContentMediaPreviewModal: (props: { show: boolean; showDelete?: boolean }) => {
		hoisted.previewProps.push(props);
		return props.show ? <div data-testid="reel-preview-modal" /> : null;
	},
}));

/** Minimal JWT whose payload carries the given global role — exercises the real token gate. */
function tokenWithRole(role: string): string {
	const payload = btoa(JSON.stringify({ role })).replace(/=+$/, '');
	return `header.${payload}.signature`;
}

let currentToken = tokenWithRole('SUPER_ADMIN');

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: () => ({ token: currentToken, isAuthenticated: true }),
}));

const reel: ReelDetail = {
	id: 42,
	title: 'Sunset run',
	description: 'A short clip',
	videoUrl: 'https://cdn.test/reel-42.mp4',
	creatorId: 'creator-1',
	creatorName: 'Creator One',
	faces: [{ faceId: 7, title: 'Demo face' }],
	likesCount: 3,
	commentsCount: 1,
	approvalStatus: 'PendingApproval',
	aiReviewStatus: 'RecommendedApprove',
	createdAt: '2026-05-01T10:00:00.000Z',
	updatedAt: '2026-05-02T10:00:00.000Z',
	submittedAtUtc: '2026-05-01T11:00:00.000Z',
	aiReviewDecision: 'Approve',
	aiReviewRiskLevel: 'Low',
	aiReviewFlagsJson: '["spam"]',
	aiReviewReason: 'Nothing found',
	aiReviewModelVersion: 'qwen2.5:7b-instruct',
	aiReviewTraceId: 'trace-1',
};

/** MemoryRouter only supplies the `<Link>` context — every router hook the page reads is mocked above. */
function renderInRouter() {
	return render(
		<MemoryRouter>
			<ReelDetailPage />
		</MemoryRouter>
	);
}

function renderPage(overrides: Partial<ReelDetail> = {}) {
	hoisted.reelQuery.data = { ...reel, ...overrides };
	return renderInRouter();
}

describe('ReelDetailPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		hoisted.previewProps.length = 0;
		currentToken = tokenWithRole('SUPER_ADMIN');
		hoisted.reelQuery.isLoading = false;
		hoisted.reelQuery.isError = false;
		hoisted.reelQuery.error = null;
		hoisted.reelQuery.data = reel;
	});

	it('RDM-U8: renders the Template B cards in order with their testids', () => {
		renderPage();

		const cardIds = Array.from(document.querySelectorAll('[data-testid^="reel-detail-"]')).map(
			(el) => el.getAttribute('data-testid')
		);
		expect(cardIds).toEqual(['reel-detail-overview', 'reel-detail-video', 'reel-detail-ai']);

		// Overview data actually comes from the mocked API response.
		expect(screen.getByText('Sunset run')).toBeTruthy();
		expect(screen.getByText('Creator One')).toBeTruthy();
		expect(screen.getByText('Demo face')).toBeTruthy();
		// AI card is read-only and shows the parsed flags.
		expect(screen.getByText('spam')).toBeTruthy();
		// Video card plays the reel inline.
		expect(document.querySelector('video')?.getAttribute('src')).toBe(
			'https://cdn.test/reel-42.mp4'
		);
	});

	it('RDM-U8: video card falls back to the empty-state copy when videoUrl is missing', () => {
		renderPage({ videoUrl: undefined });

		expect(screen.getByTestId('reel-detail-video')).toBeTruthy();
		expect(document.querySelector('video')).toBeNull();
		expect(screen.getByText('pages.reelDetail.videoEmpty')).toBeTruthy();
	});

	it('RDM-U9: mounts the preview modal with showDelete={false}', () => {
		renderPage();

		expect(hoisted.previewProps.length).toBeGreaterThan(0);
		for (const props of hoisted.previewProps) {
			expect(props.showDelete).toBe(false);
		}
		// Closed until the operator opens it, then rendered.
		expect(screen.queryByTestId('reel-preview-modal')).toBeNull();
		fireEvent.click(screen.getByRole('button', { name: 'pages.reelDetail.openPreview' }));
		expect(screen.getByTestId('reel-preview-modal')).toBeTruthy();
		expect(hoisted.previewProps.at(-1)?.showDelete).toBe(false);
	});

	it('RDM-U3: the moderation card is hidden for a non–super-admin token', () => {
		currentToken = tokenWithRole('ADMIN');
		renderPage();

		expect(screen.queryByText('pages.reelDetail.moderationSection')).toBeNull();
		expect(screen.queryByRole('button', { name: 'pages.reelDetail.deleteReel' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'pages.reelDetail.openInQueue' })).toBeNull();
		// Read-only cards stay visible.
		expect(screen.getByTestId('reel-detail-overview')).toBeTruthy();
	});

	it('RDM-U3: the moderation card is shown for a super-admin token', () => {
		renderPage();

		expect(screen.getByText('pages.reelDetail.moderationSection')).toBeTruthy();
		expect(screen.getByRole('button', { name: 'pages.reelDetail.deleteReel' })).toBeTruthy();
	});

	it('RDM-U4: Open chat navigates to the localized user-chat deep link', () => {
		renderPage();

		fireEvent.click(screen.getByRole('button', { name: 'pages.reelDetail.openChat' }));
		expect(hoisted.navigate).toHaveBeenCalledWith('/en/user-chat?u=creator-1');
	});

	it('RDM-U6: Open in queue navigates with contentId so the queue filters to this reel', () => {
		renderPage();

		fireEvent.click(screen.getByRole('button', { name: 'pages.reelDetail.openInQueue' }));
		expect(hoisted.navigate).toHaveBeenCalledWith(
			'/en/moderation?contentType=Reel&faceId=7&contentId=42'
		);
	});

	it('RDM-U7: Approve opens the override dialog instead of mutating when AI recommended reject', () => {
		renderPage({ aiReviewStatus: 'RecommendedReject' });

		fireEvent.click(screen.getByRole('button', { name: 'pages.reelDetail.approve' }));

		// Dialog opened in reason-only mode; nothing was sent to the API yet.
		expect(screen.getByText('pages.reelDetail.approve', { selector: '.modal-title' })).toBeTruthy();
		expect(screen.getAllByRole('textbox')).toHaveLength(1);
		expect(hoisted.moderationMutate).not.toHaveBeenCalled();
	});

	it('RDM-U7: Approve without a RecommendedReject flag mutates straight away', async () => {
		renderPage();

		fireEvent.click(screen.getByRole('button', { name: 'pages.reelDetail.approve' }));

		await waitFor(() =>
			expect(hoisted.moderationMutate).toHaveBeenCalledWith(
				expect.objectContaining({ reelId: 42, faceId: 7, action: 'approve' })
			)
		);
	});

	it('RDM-U3: approve/reject controls are omitted once the reel is no longer pending', () => {
		renderPage({ approvalStatus: 'Approved' });

		expect(screen.queryByRole('button', { name: 'pages.reelDetail.approve' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'pages.reelDetail.reject' })).toBeNull();
		// Hard delete stays available to a super-admin.
		expect(screen.getByRole('button', { name: 'pages.reelDetail.deleteReel' })).toBeTruthy();
	});

	it('renders the error state instead of the cards when the detail query fails', () => {
		hoisted.reelQuery.isError = true;
		hoisted.reelQuery.error = new Error('Reel not found');
		hoisted.reelQuery.data = undefined;
		renderInRouter();

		expect(screen.getByText('Reel not found')).toBeTruthy();
		expect(screen.queryByTestId('reel-detail-overview')).toBeNull();
	});

	it('renders the loading state while the detail query is in flight', () => {
		hoisted.reelQuery.isLoading = true;
		hoisted.reelQuery.data = undefined;
		renderInRouter();

		expect(screen.getByText('common.loading')).toBeTruthy();
		expect(screen.queryByTestId('reel-detail-overview')).toBeNull();
	});
});
