// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { KnowledgeReindexPanelBody } from '../KnowledgeReindexPanel';

// react-i18next is globally mocked in src/test/setup.ts to echo the key, so assertions below match
// on translation keys directly.
describe('KnowledgeReindexPanelBody', () => {
	it('renders the reindex button and fires onReindex on click', () => {
		const onReindex = vi.fn();
		render(<KnowledgeReindexPanelBody onReindex={onReindex} />);
		const button = screen.getByRole('button', {
			name: 'pages.settings.aiKnowledge.reindex.button',
		});
		fireEvent.click(button);
		expect(onReindex).toHaveBeenCalledTimes(1);
	});

	it('shows the running label and disables the button while a rebuild is in flight', () => {
		render(<KnowledgeReindexPanelBody onReindex={vi.fn()} isRunning />);
		const button = screen.getByRole('button', {
			name: 'pages.settings.aiKnowledge.reindex.running',
		});
		expect(button).toBeDisabled();
		expect(button.getAttribute('aria-busy')).toBe('true');
	});

	it('is disabled when the parent locks sub-settings (AI off / loading)', () => {
		render(<KnowledgeReindexPanelBody onReindex={vi.fn()} disabled />);
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('renders the reindex result (indexedCount / failedCount / embedModelVersion)', () => {
		render(
			<KnowledgeReindexPanelBody
				onReindex={vi.fn()}
				result={{ indexedCount: 61, failedCount: 0, embedModelVersion: 'nomic-embed-text' }}
			/>
		);
		const result = screen.getByTestId('knowledge-reindex-result');
		expect(result.textContent).toContain('61');
		expect(result.textContent).toContain('0');
		expect(result.textContent).toContain('nomic-embed-text');
	});

	it('surfaces the 409 "already running" notice and suppresses the generic error', () => {
		render(<KnowledgeReindexPanelBody onReindex={vi.fn()} alreadyRunning error />);
		expect(screen.getByText('pages.settings.aiKnowledge.reindex.alreadyRunning')).toBeTruthy();
		// When alreadyRunning is set, the generic error message must NOT also render.
		expect(screen.queryByText('pages.settings.aiKnowledge.reindex.error')).toBeNull();
	});

	it('shows the generic error message on a non-409 failure', () => {
		render(<KnowledgeReindexPanelBody onReindex={vi.fn()} error />);
		expect(screen.getByText('pages.settings.aiKnowledge.reindex.error')).toBeTruthy();
	});

	it('renders no result block before any run', () => {
		render(<KnowledgeReindexPanelBody onReindex={vi.fn()} />);
		expect(screen.queryByTestId('knowledge-reindex-result')).toBeNull();
	});
});
