import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import './DashboardPage.scss';

export function DashboardPage() {
	const { user } = useAuth();
	const { t } = useTranslation('common');
	const getLocalizedPath = useLocalizedLink();

	const stats = [
		{
			icon: '👥',
			label: t('pages.users.title'),
			value: '—',
			link: '/users',
			color: '#3b82f6',
		},
		{
			icon: '😀',
			label: t('pages.faces.title'),
			value: '—',
			link: '/faces',
			color: '#8b5cf6',
		},
	];

	return (
		<div className="dashboard-page">
			<Container fluid>
				{/* Welcome section */}
				<div className="dashboard-welcome">
					<h1 className="dashboard-welcome__title">
						{t('pages.dashboard.welcome')}
						{user ? `, ${user.firstName || user.email}` : ''}
					</h1>
					<p className="dashboard-welcome__subtitle">{t('pages.dashboard.description')}</p>
				</div>

				{/* Stats cards */}
				<Row className="g-4 mb-4">
					{stats.map((stat) => (
						<Col xs={12} sm={6} lg={4} key={stat.label}>
							<Link to={getLocalizedPath(stat.link)} className="dashboard-card-link">
								<div
									className="dashboard-card"
									style={{ '--accent-color': stat.color } as React.CSSProperties}
								>
									<div className="dashboard-card__icon">{stat.icon}</div>
									<div className="dashboard-card__info">
										<div className="dashboard-card__label">{stat.label}</div>
										<div className="dashboard-card__value">{stat.value}</div>
									</div>
									<div className="dashboard-card__arrow">→</div>
								</div>
							</Link>
						</Col>
					))}
				</Row>

				{/* Quick actions */}
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
					</Row>
				</div>
			</Container>
		</div>
	);
}
