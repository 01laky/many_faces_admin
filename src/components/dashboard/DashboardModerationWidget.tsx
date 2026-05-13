import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import { useModerationMetrics } from '../../hooks/api/useContentModerationApi';
import './DashboardModerationWidget.scss';

export interface DashboardModerationWidgetProps {
	/** Gate fetches so non-super-admin sessions never hit moderation metrics (would 403). */
	enabled: boolean;
}

/**
 * Compact SUPER_ADMIN health strip: pending queue depth, AI job failures, link to full moderation console.
 * Metrics payload is normalized by `unwrapModerationMetricsResponse` inside the shared moderation hook.
 */
export function DashboardModerationWidget({ enabled }: DashboardModerationWidgetProps) {
	const { t } = useTranslation('common');
	const getLocalizedPath = useLocalizedLink();
	const { data, isLoading, isError } = useModerationMetrics(enabled);

	if (!enabled) return null;

	return (
		<section className="dash-mod-widget" aria-labelledby="dash-mod-widget-title">
			<h2 id="dash-mod-widget-title" className="dash-mod-widget__title">
				{t('pages.dashboard.moderationWidget.title')}
			</h2>
			{isLoading && (
				<p className="dash-mod-widget__muted">{t('pages.dashboard.moderationWidget.loading')}</p>
			)}
			{isError && (
				<p className="dash-mod-widget__error" role="alert">
					{t('pages.dashboard.moderationWidget.error')}
				</p>
			)}
			{!isLoading && !isError && data && (
				<div className="dash-mod-widget__grid">
					<div className="dash-mod-widget__metric">
						<span className="dash-mod-widget__label">
							{t('pages.dashboard.moderationWidget.pending')}
						</span>
						<span className="dash-mod-widget__value">{data.pendingSubmissions}</span>
					</div>
					<div className="dash-mod-widget__metric">
						<span className="dash-mod-widget__label">
							{t('pages.dashboard.moderationWidget.aiFailed')}
						</span>
						<span className="dash-mod-widget__value">{data.aiFailedJobs}</span>
					</div>
					<div className="dash-mod-widget__metric">
						<span className="dash-mod-widget__label">
							{t('pages.dashboard.moderationWidget.needsHuman')}
						</span>
						<span className="dash-mod-widget__value">{data.needsHumanReviewCount}</span>
					</div>
					<div className="dash-mod-widget__link-wrap">
						<Link to={getLocalizedPath('/moderation')} className="dash-mod-widget__link">
							{t('pages.dashboard.moderationWidget.openConsole')}
						</Link>
					</div>
				</div>
			)}
		</section>
	);
}
