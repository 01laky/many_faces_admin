import { useMemo } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { useStats } from '@/hooks/api/useStatsApi';
import { useOperatorAiSystemSettings } from '@/hooks/api/useOperatorAiApi';
import { ApiError } from '@/api/core/ApiError';
import { isSuperAdminFromToken } from '@/utils/contentModeration';
import { shouldDashboardPrimaryStatLink } from '@/utils/dashboardPrimaryStatLinks';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { DashboardModerationWidget } from '@/components/dashboard/DashboardModerationWidget';
import { DashboardMetricsTable } from '@/components/dashboard/DashboardMetricsTable';
import { DashboardAiStatsPanel } from '@/components/dashboard/DashboardAiStatsPanel';
import './DashboardPage.scss';

/**
 * Authenticated home / dashboard: headline KPI cards, Recharts bundle, optional SUPER_ADMIN moderation widget,
 * exhaustive metrics table, and quick actions. All counts come from `GET /api/Stats` (operator-only on the API).
 */
export function DashboardPage() {
	const { user, token } = useAuth();
	const { t } = useTranslation('common');
	const getLocalizedPath = useLocalizedLink();

	const statsQuery = useStats(Boolean(token));
	const { data: statsData, isLoading: statsLoading, isError, error } = statsQuery;
	const { data: operatorAiSystemSettings } = useOperatorAiSystemSettings();
	const operatorAiGloballyEnabled = operatorAiSystemSettings?.aiEnabled === true;

	const forbidden = isError && error instanceof ApiError && error.status === 403;

	const rangeDays = 30;
	const toUtc = useMemo(() => new Date(), []);
	const fromUtc = useMemo(() => {
		const d = new Date(toUtc);
		d.setUTCDate(d.getUTCDate() - rangeDays);
		return d;
	}, [toUtc]);

	const isSuperAdmin = useMemo(() => isSuperAdminFromToken(token), [token]);

	const primaryCards = [
		{
			icon: '👥',
			label: t('pages.users.title'),
			value: statsLoading ? '…' : statsData ? String(statsData.usersCount) : '—',
			link: '/users',
			color: '#3b82f6',
		},
		{
			icon: '😀',
			label: t('pages.faces.title'),
			value: statsLoading ? '…' : statsData ? String(statsData.facesCount) : '—',
			link: '/faces',
			color: '#8b5cf6',
		},
		{
			icon: '📄',
			label: t('pages.dashboard.primary.pages'),
			value: statsLoading ? '…' : statsData ? String(statsData.pagesCount) : '—',
			link: '/faces',
			color: '#6366f1',
		},
		{
			icon: '📩',
			label: t('pages.dashboard.friendRequests'),
			value: statsLoading ? '…' : statsData ? String(statsData.friendRequestsCount) : '—',
			link: '/users',
			color: '#f59e0b',
		},
		{
			icon: '💬',
			label: t('pages.dashboard.messages'),
			value: statsLoading ? '…' : statsData ? String(statsData.messagesCount) : '—',
			link: '/chat',
			color: '#10b981',
		},
		{
			icon: '🔔',
			label: t('pages.dashboard.primary.notifications'),
			value: statsLoading ? '…' : statsData ? String(statsData.notificationsCount) : '—',
			link: '/users',
			color: '#0ea5e9',
		},
	];

	return (
		<div className="dashboard-page">
			<Container fluid>
				<div className="dashboard-welcome">
					<h1 className="dashboard-welcome__title">
						{t('pages.dashboard.welcome')}
						{user ? `, ${user.firstName || user.email}` : ''}
					</h1>
					<p className="dashboard-welcome__subtitle">{t('pages.dashboard.description')}</p>
				</div>

				{forbidden && (
					<Alert variant="warning" className="mb-4" role="alert">
						{t('pages.dashboard.statsForbidden')}
					</Alert>
				)}

				{operatorAiSystemSettings != null && !operatorAiGloballyEnabled && (
					<Alert variant="info" className="mb-4 dashboard-page__ai-off-banner" role="status">
						{t('pages.dashboard.aiDisabledBanner.message')}{' '}
						<Link to={`${getLocalizedPath('/settings')}#settings-ai-master`}>
							{t('pages.dashboard.aiDisabledBanner.cta')}
						</Link>
					</Alert>
				)}

				{isError && !forbidden && (
					<Alert variant="danger" className="mb-4" role="alert">
						{t('pages.dashboard.statsError')}
					</Alert>
				)}

				<Row className="g-3 mb-4 dashboard-page__stat-row">
					{primaryCards.map((stat) => (
						<Col xs={12} sm={6} lg={4} xl={2} key={stat.label} className="d-flex">
							{shouldDashboardPrimaryStatLink(operatorAiGloballyEnabled, stat) ? (
								<Link to={getLocalizedPath(stat.link)} className="dashboard-card-link">
									<div
										className="dashboard-card"
										style={{ '--accent-color': stat.color } as React.CSSProperties}
									>
										<div className="dashboard-card__top">
											<div className="dashboard-card__icon" aria-hidden>
												{stat.icon}
											</div>
											<span className="dashboard-card__arrow" aria-hidden>
												→
											</span>
										</div>
										<div className="dashboard-card__label">{stat.label}</div>
										<div className="dashboard-card__value">{stat.value}</div>
									</div>
								</Link>
							) : (
								<div
									className="dashboard-card-link dashboard-card-link--inactive"
									aria-current={false}
								>
									<div
										className="dashboard-card"
										style={{ '--accent-color': stat.color } as React.CSSProperties}
									>
										<div className="dashboard-card__top">
											<div className="dashboard-card__icon" aria-hidden>
												{stat.icon}
											</div>
										</div>
										<div className="dashboard-card__label">{stat.label}</div>
										<div className="dashboard-card__value">{stat.value}</div>
									</div>
								</div>
							)}
						</Col>
					))}
				</Row>

				{!forbidden && (
					<DashboardCharts
						summary={statsData}
						fromUtc={fromUtc}
						toUtc={toUtc}
						enabled={Boolean(token) && statsQuery.isSuccess}
					/>
				)}

				{!forbidden && <DashboardMetricsTable summary={statsData} />}

				<DashboardAiStatsPanel operatorAiGloballyEnabled={operatorAiGloballyEnabled} />

				<DashboardModerationWidget enabled={Boolean(isSuperAdmin && token)} />

				<div className="dashboard-section">
					<h2 className="dashboard-section__title">{t('pages.dashboard.quickActions')}</h2>
					<Row className="g-3">
						<Col xs={12} sm={6} md={4}>
							<Link to={getLocalizedPath('/users')} className="dashboard-action">
								<span className="dashboard-action__icon">👥</span>
								<span className="dashboard-action__text">{t('pages.dashboard.manageUsers')}</span>
							</Link>
						</Col>
						<Col xs={12} sm={6} md={4}>
							<Link to={getLocalizedPath('/faces')} className="dashboard-action">
								<span className="dashboard-action__icon">😀</span>
								<span className="dashboard-action__text">{t('pages.dashboard.manageFaces')}</span>
							</Link>
						</Col>
						<Col xs={12} sm={6} md={4}>
							<Link to={getLocalizedPath('/faces')} className="dashboard-action">
								<span className="dashboard-action__icon">📄</span>
								<span className="dashboard-action__text">
									{t('pages.dashboard.managePagesHint')}
								</span>
							</Link>
						</Col>
					</Row>
				</div>
			</Container>
		</div>
	);
}
