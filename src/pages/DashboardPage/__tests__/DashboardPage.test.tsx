// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '../DashboardPage';

// react-i18next + react-router-dom + react-toastify are globally mocked in src/test/setup.ts.

// Mutable per-test system-settings payload consumed by the useOperatorAiApi mock below.
let systemSettings: { aiEnabled: boolean } | undefined;

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: () => ({ user: { firstName: 'Op', email: 'op@example.com' }, token: 'test-token' }),
}));

vi.mock('@/hooks/useLocalizedLink', () => ({
	useLocalizedLink: () => (path: string) => `/en${path}`,
}));

vi.mock('@/hooks/api/useStatsApi', () => ({
	useStats: () => ({
		data: undefined,
		isLoading: false,
		isError: false,
		error: null,
		isSuccess: false,
	}),
}));

vi.mock('@/hooks/api/useOperatorAiApi', () => ({
	useOperatorAiSystemSettings: () => ({
		data: systemSettings,
		isLoading: false,
		isError: false,
	}),
}));

// Heavy dashboard children are stubbed — this test targets the AI-disabled banner only.
vi.mock('@/components/dashboard/DashboardCharts', () => ({
	DashboardCharts: () => <div data-testid="dashboard-charts" />,
}));
vi.mock('@/components/dashboard/DashboardModerationWidget', () => ({
	DashboardModerationWidget: () => null,
}));
vi.mock('@/components/dashboard/DashboardMetricsTable', () => ({
	DashboardMetricsTable: () => null,
}));
vi.mock('@/components/dashboard/DashboardAiStatsPanel', () => ({
	DashboardAiStatsPanel: () => null,
}));

function renderDashboard() {
	return render(
		<MemoryRouter>
			<DashboardPage />
		</MemoryRouter>
	);
}

describe('DashboardPage — global AI disabled banner (§6.2)', () => {
	beforeEach(() => {
		systemSettings = undefined;
	});

	it('AIS-U4: renders the AI-disabled banner with a Settings link when AI is globally off', () => {
		systemSettings = { aiEnabled: false };
		renderDashboard();

		// The banner is the only role="status" element on the page.
		const banner = screen.getByRole('status');
		expect(banner.textContent).toContain('pages.dashboard.aiDisabledBanner.message');

		// Its CTA deep-links to the master switch on the Settings page.
		const cta = screen.getByText('pages.dashboard.aiDisabledBanner.cta');
		expect(cta.getAttribute('href')).toBe('/en/settings#settings-ai-master');
	});

	it('AIS-U4: hides the banner when AI is globally on (and while settings are unknown)', () => {
		systemSettings = { aiEnabled: true };
		const { unmount } = renderDashboard();
		expect(screen.queryByText('pages.dashboard.aiDisabledBanner.message')).toBeNull();
		unmount();

		// Before the settings query resolves the banner must not flash on either.
		systemSettings = undefined;
		renderDashboard();
		expect(screen.queryByText('pages.dashboard.aiDisabledBanner.message')).toBeNull();
	});
});
