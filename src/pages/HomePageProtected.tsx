import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { UsersTable } from '../components/UsersTable';
import './HomePage.scss';

export function HomePageProtected() {
	const { user } = useAuth();
	const { t } = useTranslation('common');

	return (
		<div className="home-page-wrapper" style={{ padding: '2rem' }}>
			<Container fluid className="h-100 p-0">
				<Row className="h-100 g-0">
					<Col xs={12} className="app-content">
						<div className="homepage-content">
							<div className="homepage-header mb-4">
								<h1 className="m-0 mb-2">{t('pages.homepage.title')}</h1>

								{user && (
									<div>
										<p className="mb-1">
											{t('pages.homepage.welcome')}, {user.email}
										</p>
										{user.firstName && user.lastName && (
											<p className="mb-0 text-muted">
												{user.firstName} {user.lastName}
											</p>
										)}
									</div>
								)}
							</div>

							<div className="homepage-table-section">
								<UsersTable />
							</div>
						</div>
					</Col>
				</Row>
			</Container>
		</div>
	);
}
