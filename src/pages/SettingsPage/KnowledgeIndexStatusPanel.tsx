import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
	useOperatorAiKnowledgeStatus,
	OPERATOR_AI_KNOWLEDGE_EXPECTED_DOC_COUNT,
} from '@/hooks/api/useOperatorAiKnowledgeApi';
import type { KnowledgeIndexStatusPanelBodyProps, KnowledgeIndexStatusPanelProps } from './types';

/** Formats a UTC ISO timestamp for the panel, falling back to a "never" label when absent. */
function formatLastIndexed(t: TFunction, iso: string | null | undefined): string {
	if (!iso) return t('pages.settings.aiKnowledge.status.neverIndexed');
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return t('pages.settings.aiKnowledge.status.neverIndexed');
	// Always render in UTC — the panel reports index health, not viewer-local activity (§17.9).
	return date
		.toISOString()
		.replace('T', ' ')
		.replace(/\.\d+Z$/, ' UTC');
}

/**
 * Presentational body of the knowledge-index health panel (§17.9). Split out from the
 * data-fetching wrapper so it can be unit-tested with plain props (no React Query / auth).
 *
 * Shows: active index + alias, doc count vs the expected 61 bundles, last-indexed UTC time,
 * embed model version, vector dimension, and a ready / degraded badge. The AI is locale-free
 * (D10) — this panel is read-only UI chrome only.
 */
export function KnowledgeIndexStatusPanelBody({
	data,
	isLoading,
	isError,
}: KnowledgeIndexStatusPanelBodyProps) {
	const { t } = useTranslation('common');

	if (isLoading) {
		return <p className="settings-page__field-hint">{t('common.loading')}</p>;
	}

	if (isError || !data) {
		return (
			<p className="settings-page__field-hint settings-page__field-hint--error">
				{t('pages.settings.aiKnowledge.status.error')}
			</p>
		);
	}

	const expected = data.expectedDocCount || OPERATOR_AI_KNOWLEDGE_EXPECTED_DOC_COUNT;
	// "Healthy" only when the backend says ready AND the index is not in a single-retriever state.
	const badgeKind =
		data.ready && !data.degraded ? 'ready' : data.degraded ? 'degraded' : 'notReady';
	const modifier = badgeKind === 'ready' ? 'ok' : badgeKind === 'degraded' ? 'warn' : 'off';
	const docCountComplete = data.docCount === expected;

	return (
		<div
			className={`settings-page__infra-status settings-page__infra-status--${modifier}`}
			data-testid="knowledge-index-status"
		>
			<span className="settings-page__infra-badge">
				{t(`pages.settings.aiKnowledge.status.badge.${badgeKind}`)}
			</span>
			<span
				className={`settings-page__infra-meta${docCountComplete ? '' : ' settings-page__infra-meta--warn'}`}
			>
				{t('pages.settings.aiKnowledge.status.docCount', {
					count: data.docCount,
					expected,
				})}
			</span>
			<span className="settings-page__infra-meta">
				{t('pages.settings.aiKnowledge.status.activeIndex', {
					index: data.activeIndex,
					alias: data.alias,
				})}
			</span>
			<span className="settings-page__infra-meta">
				{t('pages.settings.aiKnowledge.status.embedModel', { model: data.embedModelVersion })}
			</span>
			<span className="settings-page__infra-meta">
				{t('pages.settings.aiKnowledge.status.vectorDim', { dim: data.vectorDim })}
			</span>
			<span className="settings-page__infra-meta settings-page__infra-meta--muted">
				{t('pages.settings.aiKnowledge.status.lastIndexed', {
					time: formatLastIndexed(t, data.lastIndexedAtUtc),
				})}
			</span>
		</div>
	);
}

/**
 * Data-fetching wrapper for the knowledge-index status panel. Disabled when AI is globally off,
 * since the index is irrelevant in that state.
 */
export function KnowledgeIndexStatusPanel({ enabled = true }: KnowledgeIndexStatusPanelProps) {
	const { t } = useTranslation('common');
	const { data, isLoading, isError } = useOperatorAiKnowledgeStatus(enabled);

	return (
		<div className="settings-page__infra-panel">
			<h4 className="settings-page__subsection-title">
				{t('pages.settings.aiKnowledge.status.title')}
			</h4>
			<p className="settings-page__field-hint">{t('pages.settings.aiKnowledge.status.hint')}</p>
			<KnowledgeIndexStatusPanelBody data={data} isLoading={isLoading} isError={isError} />
		</div>
	);
}
