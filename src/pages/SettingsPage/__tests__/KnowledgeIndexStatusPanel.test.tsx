// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KnowledgeIndexStatusPanelBody } from '../KnowledgeIndexStatusPanel';
import type { OperatorAiKnowledgeStatus } from '@/hooks/api/useOperatorAiKnowledgeApi';

// react-i18next is globally mocked in src/test/setup.ts to echo translation keys.

const healthy: OperatorAiKnowledgeStatus = {
	alias: 'operator-ai-knowledge',
	activeIndex: 'operator-ai-knowledge-v3',
	docCount: 61,
	expectedDocCount: 61,
	embedModelVersion: 'nomic-embed-text',
	vectorDim: 768,
	ready: true,
	degraded: false,
	lastIndexedAtUtc: '2026-06-01T10:30:00.000Z',
};

describe('KnowledgeIndexStatusPanelBody', () => {
	it('renders all fields and the ready badge when healthy', () => {
		render(<KnowledgeIndexStatusPanelBody data={healthy} />);
		const panel = screen.getByTestId('knowledge-index-status');
		expect(panel.className).toContain('settings-page__infra-status--ok');
		expect(screen.getByText('pages.settings.aiKnowledge.status.badge.ready')).toBeTruthy();
		// Interpolated keys are echoed without values by the mock, but every field row must render.
		expect(screen.getByText('pages.settings.aiKnowledge.status.docCount')).toBeTruthy();
		expect(screen.getByText('pages.settings.aiKnowledge.status.activeIndex')).toBeTruthy();
		expect(screen.getByText('pages.settings.aiKnowledge.status.embedModel')).toBeTruthy();
		expect(screen.getByText('pages.settings.aiKnowledge.status.vectorDim')).toBeTruthy();
		expect(screen.getByText('pages.settings.aiKnowledge.status.lastIndexed')).toBeTruthy();
	});

	it('renders the degraded badge + warn styling when degraded', () => {
		render(<KnowledgeIndexStatusPanelBody data={{ ...healthy, degraded: true }} />);
		const panel = screen.getByTestId('knowledge-index-status');
		expect(panel.className).toContain('settings-page__infra-status--warn');
		expect(screen.getByText('pages.settings.aiKnowledge.status.badge.degraded')).toBeTruthy();
	});

	it('renders the not-ready badge when the index is unbuilt / not ready', () => {
		render(<KnowledgeIndexStatusPanelBody data={{ ...healthy, ready: false, degraded: false }} />);
		const panel = screen.getByTestId('knowledge-index-status');
		expect(panel.className).toContain('settings-page__infra-status--off');
		expect(screen.getByText('pages.settings.aiKnowledge.status.badge.notReady')).toBeTruthy();
	});

	it('marks the doc-count row as a warning when below the expected 61', () => {
		render(<KnowledgeIndexStatusPanelBody data={{ ...healthy, docCount: 40 }} />);
		const docCount = screen.getByText('pages.settings.aiKnowledge.status.docCount');
		expect(docCount.className).toContain('settings-page__infra-meta--warn');
	});

	it('shows a loading hint while fetching', () => {
		render(<KnowledgeIndexStatusPanelBody isLoading />);
		expect(screen.getByText('common.loading')).toBeTruthy();
		expect(screen.queryByTestId('knowledge-index-status')).toBeNull();
	});

	it('shows an error hint on failure or missing data', () => {
		render(<KnowledgeIndexStatusPanelBody isError />);
		expect(screen.getByText('pages.settings.aiKnowledge.status.error')).toBeTruthy();
	});
});
