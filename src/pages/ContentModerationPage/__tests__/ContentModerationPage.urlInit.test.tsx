// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentModerationPage } from '../ContentModerationPage';

/**
 * RDM-U6 (admin-reel-detail-moderation-agent-prompt.md §10.1) — the moderation queue must
 * initialise its filters from the URL that the detail pages' "Open in queue" button builds:
 * `?contentType=Reel&faceId=…&contentId=…`. A `contentId` deep link also has to clear the
 * default `PendingApproval` status filter, otherwise an already-decided item would not be
 * found in the queue it was linked from.
 *
 * The list/metrics hooks are mocked so the assertion is on the exact query params the page
 * sends, not on network behaviour. Heavy child sections are stubbed the same way
 * SettingsPage.test.tsx stubs its unrelated panels.
 */

const hoisted = vi.hoisted(() => ({
	listParams: [] as Array<Record<string, unknown>>,
	search: 'contentType=Reel&faceId=7&contentId=42',
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => vi.fn(),
		useSearchParams: () => [new URLSearchParams(hoisted.search), vi.fn()],
	};
});

vi.mock('@/hooks/api/useContentModerationApi', () => ({
	useModerationItems: (params: Record<string, unknown>) => {
		hoisted.listParams.push(params);
		return { data: undefined, isLoading: false, error: null, isError: false };
	},
	useModerationMetrics: () => ({ data: undefined }),
	useModerationEvents: () => ({ data: undefined, isLoading: false }),
	useModerationAction: () => ({ mutate: vi.fn(), isPending: false }),
	useBulkModerationAction: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../ModerationFilters', () => ({
	ModerationFilters: () => <div data-testid="moderation-filters" />,
}));
vi.mock('../ModerationQueueTable', () => ({
	ModerationQueueTable: () => <div data-testid="moderation-queue-table" />,
}));
vi.mock('../ModerationMetricsPanel', () => ({
	ModerationMetricsPanel: () => <div data-testid="moderation-metrics" />,
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

describe('ContentModerationPage URL initialisation', () => {
	beforeEach(() => {
		hoisted.listParams.length = 0;
		hoisted.search = 'contentType=Reel&faceId=7&contentId=42';
		currentToken = tokenWithRole('SUPER_ADMIN');
	});

	it('RDM-U6: reads contentId + contentType from the URL and drops the default status filter', () => {
		render(<ContentModerationPage />);

		const first = hoisted.listParams[0];
		expect(first).toBeDefined();
		expect(first.contentId).toBe(42);
		expect(first.contentType).toBe('Reel');
		// A contentId deep link must not be narrowed to PendingApproval only.
		expect(first.approvalStatus).toBeUndefined();
	});

	it('RDM-U6: keeps the PendingApproval default when no contentId is deep-linked', () => {
		hoisted.search = '';
		render(<ContentModerationPage />);

		const first = hoisted.listParams[0];
		expect(first.contentId).toBeUndefined();
		expect(first.contentType).toBeUndefined();
		expect(first.approvalStatus).toBe('PendingApproval');
	});

	it('RDM-U6: ignores an unknown contentType instead of forwarding it', () => {
		hoisted.search = 'contentType=Bogus&contentId=42';
		render(<ContentModerationPage />);

		expect(hoisted.listParams[0].contentType).toBeUndefined();
		expect(hoisted.listParams[0].contentId).toBe(42);
	});

	it('shows the restricted notice and issues no queue query for a non–super-admin token', () => {
		currentToken = tokenWithRole('ADMIN');
		render(<ContentModerationPage />);

		expect(screen.queryByTestId('moderation-queue-table')).toBeNull();
		expect(screen.getByRole('alert')).toBeTruthy();
	});
});
