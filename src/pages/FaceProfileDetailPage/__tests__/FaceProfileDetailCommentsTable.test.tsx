// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FaceProfileDetailCommentsTable } from '../FaceProfileDetailCommentsTable';
import { PROFILE_DETAIL_TEST_IDS } from '@/utils/faceProfileDetailUi';

/**
 * ADPM-U12 (admin-face-profile-detail-management-agent-prompt.md §9.1) — the per-row delete
 * control must not leak its click into a row navigation: the comments table is rendered without
 * `onRowClick`, so no row carries an activation handler, and the delete button reports only the
 * comment id it belongs to. Also covers the super-admin gating of the actions column (ADPM-U3).
 */

const hoisted = vi.hoisted(() => ({
	comments: [
		{
			id: 55,
			userId: 'author-1',
			body: 'A perfectly ordinary comment',
			createdAt: '2026-05-01T10:00:00.000Z',
			authorDisplayName: 'Author One',
		},
		{
			id: 56,
			userId: 'author-2',
			body: 'Another comment',
			createdAt: '2026-05-02T10:00:00.000Z',
		},
	],
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock('@/hooks/useLocalizedLink', () => ({
	useLocalizedLink: () => (path: string) => `/en/${path.replace(/^\//, '')}`,
}));

vi.mock('@/hooks/api/useFaceProfilesApi', () => ({
	useFaceProfileComments: () => ({
		data: {
			items: hoisted.comments,
			totalCount: hoisted.comments.length,
			totalPages: 1,
			page: 1,
			pageSize: 10,
		},
		isLoading: false,
		isError: false,
		error: null,
		refetch: vi.fn(),
	}),
}));

function renderTable(isSuperAdmin: boolean, onDeleteComment = vi.fn()) {
	render(
		<MemoryRouter>
			<FaceProfileDetailCommentsTable
				faceId={7}
				userId="user-9"
				isSuperAdmin={isSuperAdmin}
				onDeleteComment={onDeleteComment}
			/>
		</MemoryRouter>
	);
	return onDeleteComment;
}

describe('FaceProfileDetailCommentsTable', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('ADPM-U12: delete reports its own comment id and no row carries a navigate handler', () => {
		const onDeleteComment = renderTable(true);

		const deleteButtons = screen.getAllByRole('button', { name: 'common.delete' });
		expect(deleteButtons).toHaveLength(2);

		fireEvent.click(deleteButtons[1]);
		expect(onDeleteComment).toHaveBeenCalledTimes(1);
		expect(onDeleteComment).toHaveBeenCalledWith(56);

		// The shell only makes rows clickable when an onRowClick is supplied; this table supplies none.
		const section = screen.getByTestId(PROFILE_DETAIL_TEST_IDS.comments);
		expect(section.querySelectorAll('tbody tr[role="button"]')).toHaveLength(0);
		expect(section.querySelectorAll('tbody tr[tabindex]')).toHaveLength(0);
		expect(section.querySelectorAll('.admin-data-table__row--clickable')).toHaveLength(0);
	});

	it('ADPM-U3: the actions column is omitted for a non–super-admin operator', () => {
		renderTable(false);

		expect(screen.queryByRole('button', { name: 'common.delete' })).toBeNull();
		// Rows still render read-only, with the author deep link intact.
		expect(screen.getByText('Author One')).toBeTruthy();
	});

	it('renders the comment rows from the mocked API page', () => {
		renderTable(true);

		expect(screen.getByText('A perfectly ordinary comment')).toBeTruthy();
		// Falls back to the raw user id when the API sends no display name.
		expect(screen.getByText('author-2')).toBeTruthy();
	});
});
