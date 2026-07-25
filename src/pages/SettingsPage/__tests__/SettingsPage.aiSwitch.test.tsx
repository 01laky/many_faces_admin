// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsPage } from '../SettingsPage';

// react-i18next + react-router-dom + react-toastify are globally mocked in src/test/setup.ts.
// Unlike SettingsPage.test.tsx, `useConfirmModal` is NOT mocked here — the AIS-U2 case exercises
// the real confirm-dialog flow (click switch → modal → Cancel) end to end.

const noopMutation = { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false };
// Dedicated spy for the master-switch PUT so the cancel path can assert it never fires.
const updateSystemAiMutateAsync = vi.fn();

vi.mock('@/hooks/api/useOperatorAiApi', () => ({
	useOperatorAiWorkerHostProfile: () => ({ data: { profile: undefined } }),
	useOperatorAiPublicStatsSettings: () => ({
		data: { publicStatsMode: 'live', liveMaxParallelBundleCalls: 2 },
		isLoading: false,
		isError: false,
	}),
	useOperatorAiSystemSettings: () => ({
		data: { aiEnabled: true },
		isLoading: false,
		isError: false,
	}),
	useUpdateOperatorAiSystemSettings: () => ({
		mutate: vi.fn(),
		mutateAsync: updateSystemAiMutateAsync,
		isPending: false,
	}),
	useOperatorAiLiveStatsCacheSettings: () => ({
		data: { ttlMilliseconds: 120000, minTtlMilliseconds: 30000, maxTtlMilliseconds: 3600000 },
		isLoading: false,
		isError: false,
	}),
	useUpdateOperatorAiLiveStatsCacheSettings: () => noopMutation,
	useUpdateOperatorAiPublicStatsSettings: () => noopMutation,
}));

// Knowledge hooks (reindex button + status panel embedded in the page).
vi.mock('@/hooks/api/useOperatorAiKnowledgeApi', () => ({
	useReindexOperatorAiKnowledge: () => noopMutation,
	useOperatorAiKnowledgeStatus: () => ({
		data: undefined,
		isLoading: false,
		isError: false,
	}),
	isReindexAlreadyRunningError: () => false,
	OPERATOR_AI_KNOWLEDGE_EXPECTED_DOC_COUNT: 61,
}));

// Heavy / unrelated subsections — stubbed so the test focuses on the master switch.
vi.mock('../AiWorkerHostPanel', () => ({
	AiWorkerHostSection: () => <div data-testid="ai-worker-host" />,
}));
vi.mock('../InfrastructureWorkersSection', () => ({
	InfrastructureWorkersSection: () => <div data-testid="infra-workers" />,
}));
vi.mock('@/components/LanguageSwitcher', () => ({
	LanguageSwitcher: () => <div data-testid="language-switcher" />,
}));

describe('SettingsPage — global AI master switch confirm flow (§6.2)', () => {
	beforeEach(() => {
		updateSystemAiMutateAsync.mockClear();
	});

	it('AIS-U2: cancelling the confirm dialog reverts the switch and issues no PUT', () => {
		render(<SettingsPage />);

		// AI is globally on, so the switch starts checked and a click proposes DISABLING it.
		const masterSwitch = screen.getByRole('switch');
		expect(masterSwitch.getAttribute('aria-checked')).toBe('true');

		fireEvent.click(masterSwitch);

		// The real ConfirmModal opens with the disable-confirmation copy.
		expect(screen.getByText('pages.settings.aiSystem.disableConfirm.message')).toBeTruthy();

		// Cancel instead of confirming.
		fireEvent.click(screen.getByText('pages.settings.aiSystem.confirm.cancel'));

		// No PUT was issued and the switch still reflects the (unchanged) server state.
		expect(updateSystemAiMutateAsync).not.toHaveBeenCalled();
		expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
	});
});
