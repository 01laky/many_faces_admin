import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	isReindexAlreadyRunningError,
	useReindexOperatorAiKnowledge,
	type OperatorAiKnowledgeReindexResult,
} from '@/hooks/api/useOperatorAiKnowledgeApi';
import { Button } from '@/components/radix/Button';
import { KnowledgeIndexStatusPanel } from './KnowledgeIndexStatusPanel';
import type { KnowledgeReindexPanelBodyProps, KnowledgeReindexPanelProps } from './types';

/**
 * Presentational body of the "Reindex knowledge" control (§8.1). Stateless and prop-driven so it
 * can be unit-tested without React Query: it renders the button, the disabled/running state, the
 * last-run result (`indexedCount` / `failedCount` / `embedModelVersion` + last-indexed time), and a
 * dedicated "already running" (HTTP 409, §17.5) notice.
 */
export function KnowledgeReindexPanelBody({
	onReindex,
	isRunning,
	disabled,
	result,
	error,
	alreadyRunning,
}: KnowledgeReindexPanelBodyProps) {
	const { t } = useTranslation('common');

	return (
		<>
			<Button
				type="button"
				variant="secondary"
				disabled={disabled || isRunning}
				aria-busy={isRunning}
				onClick={onReindex}
			>
				{isRunning
					? t('pages.settings.aiKnowledge.reindex.running')
					: t('pages.settings.aiKnowledge.reindex.button')}
			</Button>

			{alreadyRunning && (
				<p className="settings-page__field-hint settings-page__field-hint--muted" role="status">
					{t('pages.settings.aiKnowledge.reindex.alreadyRunning')}
				</p>
			)}

			{error && !alreadyRunning && (
				<p className="settings-page__field-hint settings-page__field-hint--error" role="alert">
					{t('pages.settings.aiKnowledge.reindex.error')}
				</p>
			)}

			{result && (
				<dl className="settings-page__infra-result" data-testid="knowledge-reindex-result">
					<div>
						<dt>{t('pages.settings.aiKnowledge.reindex.indexedCount')}</dt>
						<dd>{result.indexedCount}</dd>
					</div>
					<div>
						<dt>{t('pages.settings.aiKnowledge.reindex.failedCount')}</dt>
						<dd>{result.failedCount}</dd>
					</div>
					<div>
						<dt>{t('pages.settings.aiKnowledge.reindex.embedModel')}</dt>
						<dd>{result.embedModelVersion}</dd>
					</div>
				</dl>
			)}
		</>
	);
}

/**
 * Reindex-knowledge control wired to the backend.
 *
 * One of the three controls on Settings → AI (§8.1). Clicking forces a full rebuild via
 * `POST /admin/api/operator-ai/knowledge/reindex`; the button is disabled while running. A 409
 * (single-flight lock already held, §17.5) is surfaced as a distinct, non-error "already running"
 * message rather than a generic failure. The read-only health panel (§17.9) is rendered alongside.
 */
export function KnowledgeReindexPanel({
	disabled = false,
	aiEnabled = true,
}: KnowledgeReindexPanelProps) {
	const { t } = useTranslation('common');
	const reindex = useReindexOperatorAiKnowledge();
	const [result, setResult] = useState<OperatorAiKnowledgeReindexResult | null>(null);
	const [error, setError] = useState(false);
	const [alreadyRunning, setAlreadyRunning] = useState(false);

	const onReindex = useCallback(async () => {
		setError(false);
		setAlreadyRunning(false);
		try {
			const next = await reindex.mutateAsync();
			setResult(next);
		} catch (err) {
			// 409 = a rebuild is already in flight (startup refresh or another admin) — not a failure.
			if (isReindexAlreadyRunningError(err)) {
				setAlreadyRunning(true);
				return;
			}
			setError(true);
		}
	}, [reindex]);

	return (
		<div id="settings-ai-knowledge" className="settings-page__subsection">
			<h3 className="settings-page__subsection-title">
				{t('pages.settings.aiKnowledge.sectionTitle')}
			</h3>
			<p className="settings-page__subsection-desc">
				{t('pages.settings.aiKnowledge.description')}
			</p>
			<KnowledgeReindexPanelBody
				onReindex={() => void onReindex()}
				isRunning={reindex.isPending}
				disabled={disabled}
				result={result}
				error={error}
				alreadyRunning={alreadyRunning}
			/>
			<KnowledgeIndexStatusPanel enabled={aiEnabled && !disabled} />
		</div>
	);
}
