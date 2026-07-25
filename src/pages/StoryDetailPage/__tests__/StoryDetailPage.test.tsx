// @vitest-environment happy-dom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StoryDetailPage } from '../StoryDetailPage';
import type { StoryDetail } from '@/hooks/api/useStoriesApi/types';

/**
 * Page-level coverage for admin-story-detail-management-agent-prompt.md §10.1:
 *  - SDM-U3  management card hidden for a non–super-admin token
 *  - SDM-U4  "Open chat" navigates to the localized user-chat deep link
 *  - SDM-U5  Template B cards (overview, images) render with their testids
 *  - SDM-U6  viewers card omitted when the detail carries no viewers
 *  - SDM-U8  per-image delete goes through the reason dialog, not a bare confirm
 *  - SDM-U9  deleting the story navigates back to the face detail path
 *  - SDM-U10 an `image_delete_blocked_live` failure is toasted through the mapped copy
 *  - SDM-U11 image-tile delete controls hidden for a non–super-admin token
 *
 * `@/hooks/api/useStoriesApi` is mocked with fixture data (the page never touches the generated
 * OpenAPI client directly); react-router-dom hooks are re-pinned over the global setup mock.
 */

const hoisted = vi.hoisted(() => ({
	navigate: vi.fn(),
	search: 'faceId=7',
	deleteStory: vi.fn().mockResolvedValue(undefined),
	deleteImage: vi.fn().mockResolvedValue(undefined),
	storyQuery: {
		data: undefined as StoryDetail | undefined,
		isLoading: false,
		isError: false,
		error: null as unknown,
		refetch: vi.fn().mockResolvedValue(undefined),
	},
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => hoisted.navigate,
		useParams: () => ({ id: '15' }),
		useSearchParams: () => [new URLSearchParams(hoisted.search), vi.fn()],
	};
});

vi.mock('@/hooks/useLocalizedLink', () => ({
	useLocalizedLink: () => (path: string) => `/en/${path.replace(/^\//, '')}`,
}));

vi.mock('@/hooks/api/useStoriesApi', () => ({
	useStory: () => hoisted.storyQuery,
	useDeleteStory: () => ({ mutateAsync: hoisted.deleteStory, isPending: false }),
	useDeleteStoryImage: () => ({ mutateAsync: hoisted.deleteImage, isPending: false }),
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

const story: StoryDetail = {
	id: 15,
	title: 'Launch day',
	creatorId: 'creator-1',
	creatorName: 'Creator One',
	state: 'Published',
	publishedAt: '2026-05-01T10:00:00.000Z',
	expiresAt: '2099-01-01T00:00:00.000Z',
	createdAt: '2026-05-01T09:00:00.000Z',
	updatedAt: '2026-05-01T09:30:00.000Z',
	images: [
		{ id: 101, imageUrl: 'https://cdn.test/one.jpg', sortOrder: 1 },
		{ id: 100, imageUrl: 'https://cdn.test/zero.jpg', sortOrder: 0 },
	],
	faces: [{ faceId: 7, title: 'Demo face' }],
	likesCount: 4,
	commentsCount: 2,
	viewCount: 9,
	viewers: [
		{ viewerUserId: 'viewer-1', viewerName: 'Viewer One', viewedAt: '2026-05-01T12:00:00.000Z' },
	],
};

function renderInRouter() {
	return render(
		<MemoryRouter>
			<StoryDetailPage />
		</MemoryRouter>
	);
}

function renderPage(overrides: Partial<StoryDetail> = {}) {
	hoisted.storyQuery.data = { ...story, ...overrides };
	return renderInRouter();
}

/** Fills the reason dialog with a valid reason (the user message auto-syncs) and confirms. */
function confirmReasonDialog(reason = 'Removed for policy violation') {
	fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: reason } });
	fireEvent.click(screen.getByRole('button', { name: 'common.ok' }));
}

describe('StoryDetailPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		currentToken = tokenWithRole('SUPER_ADMIN');
		hoisted.search = 'faceId=7';
		hoisted.storyQuery.isLoading = false;
		hoisted.storyQuery.isError = false;
		hoisted.storyQuery.error = null;
		hoisted.storyQuery.data = story;
		hoisted.deleteImage.mockResolvedValue(undefined);
		hoisted.deleteStory.mockResolvedValue(undefined);
	});

	it('SDM-U5: renders the Template B cards with their testids and the story payload', () => {
		renderPage();

		expect(screen.getByTestId('story-detail-overview')).toBeTruthy();
		expect(screen.getByTestId('story-detail-images')).toBeTruthy();
		expect(screen.getByText('Launch day')).toBeTruthy();
		expect(screen.getByText('Creator One')).toBeTruthy();
		expect(screen.getByText('Demo face')).toBeTruthy();
		// Live badge derives from state + published/expires window.
		expect(screen.getByText('pages.storyDetail.liveYes')).toBeTruthy();
		// Both images reach the grid, sorted by sortOrder.
		const thumbs = Array.from(screen.getByTestId('content-media-grid').querySelectorAll('img')).map(
			(img) => img.getAttribute('src')
		);
		expect(thumbs).toEqual(['https://cdn.test/zero.jpg', 'https://cdn.test/one.jpg']);
	});

	it('SDM-U5: an expired story shows the not-live badge', () => {
		renderPage({ state: 'Expired', expiresAt: '2020-01-01T00:00:00.000Z' });

		expect(screen.getByText('pages.storyDetail.liveNo')).toBeTruthy();
		expect(screen.getByText('pages.storyDetail.stateExpired')).toBeTruthy();
	});

	it('SDM-U5: images card falls back to the empty-state copy when the story has none', () => {
		renderPage({ images: [] });

		expect(screen.getByTestId('story-detail-images')).toBeTruthy();
		expect(screen.queryByTestId('content-media-grid')).toBeNull();
		expect(screen.getByText('pages.storyDetail.imagesEmpty')).toBeTruthy();
	});

	it('SDM-U6: viewers card is rendered when the detail carries viewers', () => {
		renderPage();

		expect(screen.getByTestId('story-detail-viewers')).toBeTruthy();
		expect(screen.getByText('Viewer One')).toBeTruthy();
	});

	it('SDM-U6: viewers card is omitted when the viewers list is empty', () => {
		renderPage({ viewers: [] });

		expect(screen.queryByTestId('story-detail-viewers')).toBeNull();
		expect(screen.queryByText('pages.storyDetail.viewersSection')).toBeNull();
	});

	it('SDM-U3: management card hidden for a non–super-admin token', () => {
		currentToken = tokenWithRole('ADMIN');
		renderPage();

		expect(screen.queryByText('pages.storyDetail.managementSection')).toBeNull();
		expect(screen.queryByRole('button', { name: 'pages.storyDetail.deleteStory' })).toBeNull();
		expect(screen.getByTestId('story-detail-overview')).toBeTruthy();
	});

	it('SDM-U11: image-tile delete controls hidden for a non–super-admin token', () => {
		currentToken = tokenWithRole('ADMIN');
		renderPage();

		expect(screen.getByTestId('content-media-grid')).toBeTruthy();
		expect(screen.queryByRole('button', { name: 'pages.albumDetail.deleteMedia' })).toBeNull();
	});

	it('SDM-U4: Open chat navigates to the localized user-chat deep link', () => {
		renderPage();

		fireEvent.click(screen.getByRole('button', { name: 'pages.storyDetail.openChat' }));
		expect(hoisted.navigate).toHaveBeenCalledWith('/en/user-chat?u=creator-1');
	});

	it('SDM-U8: per-image delete opens the reason dialog and only then calls the API', async () => {
		renderPage();

		const deleteButtons = screen.getAllByRole('button', { name: 'pages.albumDetail.deleteMedia' });
		fireEvent.click(deleteButtons[0]);

		// Dialog is open, nothing sent yet.
		expect(screen.getByText('pages.storyDetail.deleteImage')).toBeTruthy();
		expect(hoisted.deleteImage).not.toHaveBeenCalled();

		confirmReasonDialog();

		await waitFor(() =>
			expect(hoisted.deleteImage).toHaveBeenCalledWith({
				storyId: 15,
				imageId: 100,
				payload: {
					faceId: 7,
					reason: 'Removed for policy violation',
					userMessage: 'Removed for policy violation',
				},
			})
		);
	});

	it('SDM-U10: a blocked last-image delete on a live story is toasted with the mapped copy', async () => {
		hoisted.deleteImage.mockRejectedValueOnce(new Error('image_delete_blocked_live'));
		renderPage();

		fireEvent.click(screen.getAllByRole('button', { name: 'pages.albumDetail.deleteMedia' })[0]);
		confirmReasonDialog();

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith('pages.storyDetail.imageDeleteBlockedLive')
		);
	});

	it('SDM-U9: deleting the story navigates back to the face detail path', async () => {
		renderPage();

		fireEvent.click(screen.getByRole('button', { name: 'pages.storyDetail.deleteStory' }));
		expect(
			screen.getByText('pages.storyDetail.deleteStory', { selector: '.modal-title' })
		).toBeTruthy();
		confirmReasonDialog();

		await waitFor(() =>
			expect(hoisted.deleteStory).toHaveBeenCalledWith({
				storyId: 15,
				payload: {
					faceId: 7,
					reason: 'Removed for policy violation',
					userMessage: 'Removed for policy violation',
				},
			})
		);
		await waitFor(() => expect(hoisted.navigate).toHaveBeenCalledWith('/en/faces/7'));
	});

	it('renders the missing-face state when the URL carries no usable faceId', () => {
		hoisted.search = '';
		renderPage();

		expect(screen.getByText('pages.storyDetail.missingFaceId')).toBeTruthy();
		expect(screen.queryByTestId('story-detail-overview')).toBeNull();
	});

	it('renders the error state instead of the cards when the detail query fails', () => {
		hoisted.storyQuery.isError = true;
		hoisted.storyQuery.error = new Error('Story not found');
		hoisted.storyQuery.data = undefined;
		renderInRouter();

		expect(screen.getByText('Story not found')).toBeTruthy();
		expect(screen.queryByTestId('story-detail-overview')).toBeNull();
	});

	it('renders the not-found state when the query resolves with no story', () => {
		hoisted.storyQuery.data = undefined;
		renderInRouter();

		expect(screen.getByText('pages.storyDetail.notFound')).toBeTruthy();
	});
});
