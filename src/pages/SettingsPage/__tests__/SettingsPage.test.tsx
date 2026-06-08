// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsPage } from '../SettingsPage';

// react-i18next + react-router-dom + react-toastify are globally mocked in src/test/setup.ts.

const noopMutation = { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false };

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
	useUpdateOperatorAiSystemSettings: () => noopMutation,
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
		data: {
			alias: 'operator-ai-knowledge',
			activeIndex: 'operator-ai-knowledge-v1',
			docCount: 61,
			expectedDocCount: 61,
			embedModelVersion: 'nomic-embed-text',
			vectorDim: 768,
			ready: true,
			degraded: false,
			lastIndexedAtUtc: '2026-06-01T10:00:00.000Z',
		},
		isLoading: false,
		isError: false,
	}),
	isReindexAlreadyRunningError: () => false,
	OPERATOR_AI_KNOWLEDGE_EXPECTED_DOC_COUNT: 61,
}));

vi.mock('@/hooks/useConfirmModal', () => ({
	useConfirmModal: () => ({ confirm: vi.fn(), ConfirmModalHost: null }),
}));

// Heavy / unrelated subsections — stubbed so the test focuses on the three AI controls.
vi.mock('../AiWorkerHostPanel', () => ({
	AiWorkerHostSection: () => <div data-testid="ai-worker-host" />,
}));
vi.mock('../InfrastructureWorkersSection', () => ({
	InfrastructureWorkersSection: () => <div data-testid="infra-workers" />,
}));
vi.mock('@/components/LanguageSwitcher', () => ({
	LanguageSwitcher: () => <div data-testid="language-switcher" />,
}));

describe('SettingsPage — AI controls (RAG refactor v1, §8.1)', () => {
	it('renders exactly the three AI controls: global switch, reindex button, max-parallel input', () => {
		render(<SettingsPage />);

		// Control 1: the global AI enable switch.
		expect(screen.getByRole('switch')).toBeTruthy();

		// Control 2: the reindex-knowledge button.
		expect(
			screen.getByRole('button', { name: 'pages.settings.aiKnowledge.reindex.button' })
		).toBeTruthy();

		// Control 3: the max-parallel-bundle-calls input.
		expect(document.getElementById('ai-live-parallel')).toBeTruthy();
	});

	it('renders the read-only knowledge-index status panel beside the reindex button (§17.9)', () => {
		render(<SettingsPage />);
		expect(screen.getByTestId('knowledge-index-status')).toBeTruthy();
	});

	it('no longer renders the removed off/inline/live stats-mode selector (D11)', () => {
		render(<SettingsPage />);
		// The old selector used radio inputs named "ai-public-stats-mode".
		expect(document.querySelector('input[name="ai-public-stats-mode"]')).toBeNull();
		expect(screen.queryByText('pages.settings.aiStats.modes.off')).toBeNull();
		expect(screen.queryByText('pages.settings.aiStats.modes.inline')).toBeNull();
	});
});
