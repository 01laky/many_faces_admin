// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModerationItemDrawer } from '../ModerationItemDrawer';
import type { ModerationItem } from '@/hooks/api/useContentModerationApi';

/**
 * RDM-U11 (admin-reel-detail-moderation-agent-prompt.md §10.1) — the queue drawer's
 * "Open reel detail" control must target `/reels/{contentId}?faceId={faceId}` so the operator
 * lands on the face-scoped reel detail page. The control is a Button + `navigate()` rather than
 * an `<a href>`, so the assertion is on the navigate target (same URL either way).
 */

const hoisted = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return { ...actual, useNavigate: () => hoisted.navigate };
});

vi.mock('@/hooks/useLocalizedLink', () => ({
	useLocalizedLink: () => (path: string) => `/en/${path.replace(/^\//, '')}`,
}));

const baseItem: ModerationItem = {
	contentType: 'Reel',
	contentId: 42,
	title: 'Sunset run',
	faceId: 7,
	faceTitle: 'Demo face',
	creatorId: 'creator-1',
	creatorName: 'Creator One',
	approvalStatus: 'PendingApproval',
	aiReviewStatus: 'RecommendedApprove',
	aiReviewDecision: 'Approve',
	aiReviewRiskLevel: 'Low',
	aiReviewFlagsJson: '["spam"]',
	aiReviewReason: 'Nothing found',
	submittedAtUtc: '2026-05-01T11:00:00.000Z',
	createdAt: '2026-05-01T10:00:00.000Z',
	bodyPreviewPlainText: 'A short clip',
};

function renderDrawer(overrides: Partial<ModerationItem> = {}, onClose = vi.fn()) {
	render(
		<ModerationItemDrawer
			item={{ ...baseItem, ...overrides }}
			events={[]}
			eventsLoading={false}
			onClose={onClose}
		/>
	);
	return onClose;
}

describe('ModerationItemDrawer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('RDM-U11: Open reel detail navigates to /reels/{id}?faceId={faceId}', () => {
		renderDrawer();

		fireEvent.click(screen.getByRole('button', { name: 'pages.moderation.openReelDetail' }));
		const target = hoisted.navigate.mock.calls[0][0] as string;
		expect(target).toContain('/reels/42?faceId=');
		expect(target).toBe('/en/reels/42?faceId=7');
	});

	it('RDM-U11: album and blog rows deep-link to their own face-scoped detail pages', () => {
		renderDrawer({ contentType: 'Album', contentId: 11 });
		fireEvent.click(screen.getByRole('button', { name: 'pages.moderation.openAlbumDetail' }));
		expect(hoisted.navigate).toHaveBeenCalledWith('/en/albums/11?faceId=7');

		hoisted.navigate.mockClear();
		renderDrawer({ contentType: 'Blog', contentId: 12 });
		fireEvent.click(screen.getByRole('button', { name: 'pages.moderation.openBlogDetail' }));
		expect(hoisted.navigate).toHaveBeenCalledWith('/en/blogs/12?faceId=7');
	});

	it('renders the AI recommendation and human moderation panes from the item payload', () => {
		renderDrawer();

		expect(screen.getByText('Reel: Sunset run')).toBeTruthy();
		expect(screen.getByText('Flags: spam')).toBeTruthy();
		expect(screen.getByText('Status: PendingApproval')).toBeTruthy();
		expect(screen.getByText('No audit events yet.')).toBeTruthy();
	});

	it('closes through the onClose callback', () => {
		const onClose = renderDrawer();

		fireEvent.click(screen.getByRole('button', { name: 'Close' }));
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
