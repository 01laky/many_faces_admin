import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { usePublicStatsSnapshot } from '@/hooks/api/usePublicStatsApi';
import { useOperatorAiPublicStatsSettings } from '@/hooks/api/useOperatorAiApi';
import {
	adminAiPublicStatsDefaults,
	normalizeAdminAiPublicStatsMode,
} from '@/utils/adminAiStatsSettings';
import './DashboardAiStatsPanel.scss';

/**
 * Dashboard strip: current AI “public statistics” mode and a peek at anonymous aggregate totals
 * (same payload the AI may use in inline/live modes).
 */
export function DashboardAiStatsPanel() {
	const { t } = useTranslation('common');
	const getLocalizedPath = useLocalizedLink();
	const { data: publicStatsSettings } = useOperatorAiPublicStatsSettings();
	const mode = normalizeAdminAiPublicStatsMode(
		publicStatsSettings?.publicStatsMode ?? adminAiPublicStatsDefaults.DEFAULT_MODE
	);
	const q = usePublicStatsSnapshot(mode !== 'off');

	return (
		<section className="dashboard-ai-stats" aria-labelledby="dashboard-ai-stats-title">
			<div className="dashboard-ai-stats__head">
				<h2 id="dashboard-ai-stats-title" className="dashboard-ai-stats__title">
					{t('pages.dashboard.aiStats.title')}
				</h2>
				<Link to={getLocalizedPath('/settings')} className="dashboard-ai-stats__settings-link">
					{t('pages.dashboard.aiStats.openSettings')} →
				</Link>
			</div>
			<p className="dashboard-ai-stats__mode">
				{t('pages.dashboard.aiStats.modeLabel')}:{' '}
				<strong>{t(`pages.settings.aiStats.modes.${mode}`)}</strong>
			</p>
			{mode === 'off' ? (
				<p className="dashboard-ai-stats__hint muted">{t('pages.dashboard.aiStats.offHint')}</p>
			) : q.isLoading ? (
				<p className="dashboard-ai-stats__hint">{t('pages.dashboard.aiStats.loading')}</p>
			) : q.isError ? (
				<p className="dashboard-ai-stats__hint error">{t('pages.dashboard.aiStats.loadError')}</p>
			) : q.data ? (
				<dl className="dashboard-ai-stats__grid">
					<div>
						<dt>{t('pages.dashboard.aiStats.fields.users')}</dt>
						<dd>{q.data.usersCount}</dd>
					</div>
					<div>
						<dt>{t('pages.dashboard.aiStats.fields.faces')}</dt>
						<dd>{q.data.facesCount}</dd>
					</div>
					<div>
						<dt>{t('pages.dashboard.aiStats.fields.messages')}</dt>
						<dd>{q.data.messagesCount}</dd>
					</div>
					<div>
						<dt>{t('pages.dashboard.aiStats.fields.stories')}</dt>
						<dd>{q.data.storiesCount}</dd>
					</div>
				</dl>
			) : null}
		</section>
	);
}
