// @vitest-environment happy-dom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient } from '@/hooks/api/__tests__/testUtils';
import { FaceProfileDetailPage } from '../FaceProfileDetailPage';
import { PROFILE_DETAIL_TEST_IDS } from '@/utils/faceProfileDetailUi';
import type { FaceProfileDetail } from '@/hooks/api/useFaceProfilesApi/types';

/**
 * Page-level coverage for admin-face-profile-detail-management-agent-prompt.md §9.1:
 *  - ADPM-U1 Template B cards render with their testids
 *  - ADPM-U2 the page offers no moderation-queue button (profiles are not moderated content)
 *  - ADPM-U3 management card hidden for a non–super-admin token
 *  - ADPM-U4 "Open chat" navigates to `user-chat?u={userId}`
 *  - ADPM-U5 reviews card absent when the face does not allow recensions
 *  - ADPM-U8 face-unban control replaces face-ban when the profile is already banned
 *  - ADPM-U10 the delete dialog is the shared reason/user-message dialog
 *
 * The comments/reviews tables stay real (only their list hooks are mocked) so the testid
 * assertions exercise the components the page actually renders.
 */

const hoisted = vi.hoisted(() => ({
	navigate: vi.fn(),
	confirm: vi.fn().mockResolvedValue(true),
	deleteComment: vi.fn().mockResolvedValue(undefined),
	deleteReview: vi.fn().mockResolvedValue(undefined),
	faceBan: vi.fn().mockResolvedValue(undefined),
	faceUnban: vi.fn().mockResolvedValue(undefined),
	profileQuery: {
		data: undefined as FaceProfileDetail | undefined,
		isLoading: false,
		isError: false,
		error: null as unknown,
	},
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => hoisted.navigate,
		useParams: () => ({ faceId: '7', userId: 'user-9' }),
		useSearchParams: () => [new URLSearchParams(''), vi.fn()],
	};
});

vi.mock('@/hooks/useLocalizedLink', () => ({
	useLocalizedLink: () => (path: string) => `/en/${path.replace(/^\//, '')}`,
}));

vi.mock('@/hooks/useConfirmModal', () => ({
	useConfirmModal: () => ({ confirm: hoisted.confirm, ConfirmModalHost: null }),
}));

const emptyPage = { items: [], totalCount: 0, totalPages: 0, page: 1, pageSize: 10 };

vi.mock('@/hooks/api/useFaceProfilesApi', () => ({
	faceProfilesKeys: {
		all: ['faceProfiles'],
		detail: (faceId: number, userId: string) => ['faceProfiles', 'detail', faceId, userId],
	},
	useFaceProfile: () => hoisted.profileQuery,
	useFaceProfileComments: () => ({
		data: emptyPage,
		isLoading: false,
		isError: false,
		error: null,
		refetch: vi.fn(),
	}),
	useFaceProfileReviews: () => ({
		data: emptyPage,
		isLoading: false,
		isError: false,
		error: null,
		refetch: vi.fn(),
	}),
	useDeleteFaceProfileComment: () => ({ mutateAsync: hoisted.deleteComment, isPending: false }),
	useDeleteFaceProfileReview: () => ({ mutateAsync: hoisted.deleteReview, isPending: false }),
}));

vi.mock('@/hooks/api/useOperatorUsersApi', () => ({
	useOperatorUserMutations: () => ({
		faceBan: { mutateAsync: hoisted.faceBan, isPending: false },
		faceUnban: { mutateAsync: hoisted.faceUnban, isPending: false },
	}),
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

const profile: FaceProfileDetail = {
	userId: 'user-9',
	displayName: 'Nina Novak',
	nickname: 'nina',
	age: 29,
	avatarUrl: 'https://cdn.test/avatar.jpg',
	faceAllowsRecensions: true,
	faceVisibility: 'Public',
	faceRoleName: 'FACE_HOST',
	isActive: true,
	commentsCount: 3,
	likesCount: 5,
	reviewsCount: 2,
	isFaceBanned: false,
	createdAt: '2026-04-01T09:00:00.000Z',
	updatedAt: '2026-04-02T09:00:00.000Z',
};

function renderPage(overrides: Partial<FaceProfileDetail> = {}) {
	hoisted.profileQuery.data = { ...profile, ...overrides };
	return render(
		<QueryClientProvider client={createTestQueryClient()}>
			<MemoryRouter>
				<FaceProfileDetailPage />
			</MemoryRouter>
		</QueryClientProvider>
	);
}

describe('FaceProfileDetailPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		hoisted.confirm.mockResolvedValue(true);
		currentToken = tokenWithRole('SUPER_ADMIN');
		hoisted.profileQuery.isLoading = false;
		hoisted.profileQuery.isError = false;
		hoisted.profileQuery.error = null;
		hoisted.profileQuery.data = profile;
	});

	it('ADPM-U1: renders the Template B cards with their testids and profile payload', () => {
		renderPage();

		expect(screen.getByTestId(PROFILE_DETAIL_TEST_IDS.overview)).toBeTruthy();
		expect(screen.getByTestId(PROFILE_DETAIL_TEST_IDS.avatar)).toBeTruthy();
		expect(screen.getByTestId(PROFILE_DETAIL_TEST_IDS.comments)).toBeTruthy();
		expect(screen.getByTestId(PROFILE_DETAIL_TEST_IDS.reviews)).toBeTruthy();
		expect(screen.getByText('Nina Novak')).toBeTruthy();
		expect(screen.getByText('FACE_HOST')).toBeTruthy();
	});

	it('ADPM-U7: no likers table / profile-detail-likes card is rendered', () => {
		renderPage();

		expect(screen.queryByTestId('profile-detail-likes')).toBeNull();
	});

	it('ADPM-U2: no moderation-queue control is offered on a profile detail', () => {
		renderPage();

		expect(screen.queryByText(/openInQueue/i)).toBeNull();
		expect(document.querySelector('a[href*="/moderation"]')).toBeNull();
	});

	it('ADPM-U5: reviews card is absent when the face does not allow recensions', () => {
		renderPage({ faceAllowsRecensions: false });

		expect(screen.queryByTestId(PROFILE_DETAIL_TEST_IDS.reviews)).toBeNull();
		// Comments stay visible — only the reviews section is conditional.
		expect(screen.getByTestId(PROFILE_DETAIL_TEST_IDS.comments)).toBeTruthy();
	});

	it('ADPM-U3: management card hidden for a non–super-admin token', () => {
		currentToken = tokenWithRole('ADMIN');
		renderPage();

		expect(screen.queryByText('pages.profileDetail.managementSection')).toBeNull();
		expect(screen.queryByRole('button', { name: 'pages.userDetail.faceBan' })).toBeNull();
		expect(screen.getByTestId(PROFILE_DETAIL_TEST_IDS.overview)).toBeTruthy();
	});

	it('ADPM-U4: Open chat navigates to the localized user-chat deep link', () => {
		renderPage();

		fireEvent.click(screen.getByRole('button', { name: 'pages.profileDetail.openChat' }));
		const target = hoisted.navigate.mock.calls[0][0] as string;
		expect(target).toContain('user-chat?u=');
		expect(target).toBe('/en/user-chat?u=user-9');
	});

	it('ADPM-U8: a banned profile offers face-unban instead of face-ban', async () => {
		renderPage({ isFaceBanned: true });

		expect(screen.queryByRole('button', { name: 'pages.userDetail.faceBan' })).toBeNull();
		fireEvent.click(screen.getByRole('button', { name: 'pages.userDetail.faceUnban' }));

		await waitFor(() => expect(hoisted.faceUnban).toHaveBeenCalledWith(7));
	});

	it('ADPM-U8: an unbanned profile offers face-ban behind the reason dialog', async () => {
		renderPage();

		expect(screen.queryByRole('button', { name: 'pages.userDetail.faceUnban' })).toBeNull();
		fireEvent.click(screen.getByRole('button', { name: 'pages.userDetail.faceBan' }));

		// Ban goes through the shared reason dialog in reason-only mode (no creator message).
		// Scoped to the dialog: the comments/reviews tables contribute their own search inputs.
		const dialogBody = document.querySelector('.modal-body') as HTMLElement;
		expect(within(dialogBody).getAllByRole('textbox')).toHaveLength(1);
		expect(hoisted.faceBan).not.toHaveBeenCalled();

		fireEvent.change(within(dialogBody).getAllByRole('textbox')[0], {
			target: { value: 'Repeated harassment in comments' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'common.ok' }));

		await waitFor(() =>
			expect(hoisted.faceBan).toHaveBeenCalledWith({
				faceId: 7,
				reason: 'Repeated harassment in comments',
			})
		);
	});

	it('ADPM-U8: declining the unban confirmation leaves the mutation uncalled', async () => {
		hoisted.confirm.mockResolvedValue(false);
		renderPage({ isFaceBanned: true });

		fireEvent.click(screen.getByRole('button', { name: 'pages.userDetail.faceUnban' }));

		await waitFor(() => expect(hoisted.confirm).toHaveBeenCalled());
		expect(hoisted.faceUnban).not.toHaveBeenCalled();
	});

	it('renders the error state instead of the cards when the detail query fails', () => {
		hoisted.profileQuery.isError = true;
		hoisted.profileQuery.error = new Error('Profile not found');
		hoisted.profileQuery.data = undefined;
		render(
			<QueryClientProvider client={createTestQueryClient()}>
				<MemoryRouter>
					<FaceProfileDetailPage />
				</MemoryRouter>
			</QueryClientProvider>
		);

		expect(screen.getByText('Profile not found')).toBeTruthy();
		expect(screen.queryByTestId(PROFILE_DETAIL_TEST_IDS.overview)).toBeNull();
	});

	it('renders the not-found state when the query resolves with no profile', () => {
		hoisted.profileQuery.data = undefined;
		render(
			<QueryClientProvider client={createTestQueryClient()}>
				<MemoryRouter>
					<FaceProfileDetailPage />
				</MemoryRouter>
			</QueryClientProvider>
		);

		expect(screen.getByText('common.notFound')).toBeTruthy();
	});
});
