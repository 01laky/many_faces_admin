import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col } from 'react-bootstrap';
import { useUser } from '../hooks/api/useUsersApi';
import { Button } from '../components/radix/Button';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import './UserDetailPage.scss';

export function UserDetailPage() {
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();

	// Fetch user by ID
	const { data: user, isLoading, error } = useUser(id || '');

	if (isLoading) {
		return (
			<div
				className="user-detail-page-wrapper"
				style={{
					padding: '2rem',
				}}
			>
				<Container fluid>
					<div className="user-detail-loading">
						<p>{t('pages.userDetail.loading')}</p>
					</div>
				</Container>
			</div>
		);
	}

	if (error) {
		return (
			<div
				className="user-detail-page-wrapper"
				style={{
					padding: '2rem',
				}}
			>
				<Container fluid>
					<div className="user-detail-error">
						<p>{t('pages.userDetail.error')}</p>
						<Button onClick={() => navigate(getLocalizedPath('/users'))}>{t('common.back')}</Button>
					</div>
				</Container>
			</div>
		);
	}

	if (!user) {
		return (
			<div
				className="user-detail-page-wrapper"
				style={{
					padding: '2rem',
				}}
			>
				<Container fluid>
					<div className="user-detail-not-found">
						<h2>{t('pages.userDetail.notFound')}</h2>
						<Button onClick={() => navigate(getLocalizedPath('/users'))}>{t('common.back')}</Button>
					</div>
				</Container>
			</div>
		);
	}

	return (
		<div
			className="user-detail-page-wrapper"
			style={{
				padding: '2rem',
			}}
		>
			<Container fluid>
				<div className="user-detail-content">
					<div className="user-detail-header">
						<Button
							variant="outline"
							onClick={() => navigate(getLocalizedPath('/users'))}
							className="back-button"
						>
							← {t('common.back')}
						</Button>
						<h1>{t('pages.userDetail.title')}</h1>
					</div>

					<div className="user-detail-card">
						<Row>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.userDetail.id')}</label>
									<p>{user.id}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.userDetail.email')}</label>
									<p>{user.email}</p>
								</div>
							</Col>
							{user.firstName && (
								<Col xs={12} md={6}>
									<div className="user-detail-field">
										<label>{t('pages.userDetail.firstName')}</label>
										<p>{user.firstName}</p>
									</div>
								</Col>
							)}
							{user.lastName && (
								<Col xs={12} md={6}>
									<div className="user-detail-field">
										<label>{t('pages.userDetail.lastName')}</label>
										<p>{user.lastName}</p>
									</div>
								</Col>
							)}
							{user.createdAt && (
								<Col xs={12} md={6}>
									<div className="user-detail-field">
										<label>{t('pages.userDetail.createdAt')}</label>
										<p>{new Date(user.createdAt).toLocaleString()}</p>
									</div>
								</Col>
							)}
						</Row>
					</div>
				</div>
			</Container>
		</div>
	);
}
