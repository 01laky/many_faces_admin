import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col } from 'react-bootstrap';
import { usePage } from '../hooks/api/usePagesApi';
import { Button } from '../components/radix/Button';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import './PageDetailPage.scss';

export function PageDetailPage() {
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();

	const pageId = id ? parseInt(id, 10) : 0;
	const { data: page, isLoading, error } = usePage(pageId);

	if (isLoading) {
		return (
			<div
				className="page-detail-page-wrapper"
				style={{
					padding: '2rem',
				}}
			>
				<Container fluid>
					<div className="page-detail-loading">
						<p>{t('pages.pageDetail.loading')}</p>
					</div>
				</Container>
			</div>
		);
	}

	if (error || !page) {
		return (
			<div
				className="page-detail-page-wrapper"
				style={{
					padding: '2rem',
				}}
			>
				<Container fluid>
					<div className="page-detail-error">
						<p>
							{t('pages.pageDetail.error')}:{' '}
							{error instanceof Error ? error.message : 'Unknown error'}
						</p>
						<Button onClick={() => navigate(getLocalizedPath(`/faces/${page?.faceId || ''}`))}>
							{t('common.back')}
						</Button>
					</div>
				</Container>
			</div>
		);
	}

	return (
		<div
			className="page-detail-page-wrapper"
			style={{
				padding: '2rem',
			}}
		>
			<Container fluid>
				<div className="page-detail-content">
					<div className="page-detail-header">
						<Button
							variant="outline"
							onClick={() => navigate(getLocalizedPath(`/faces/${page.faceId}`))}
							className="back-button"
						>
							← {t('common.back')}
						</Button>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								width: '100%',
							}}
						>
							<h1>{t('pages.pageDetail.title')}</h1>
							<Button
								variant="outline"
								onClick={() => navigate(getLocalizedPath(`/pages/${page.id}/edit`))}
							>
								{t('common.edit')}
							</Button>
						</div>
					</div>

					<div className="page-detail-card">
						<Row>
							<Col xs={12} md={6}>
								<div className="page-detail-field">
									<label>{t('pages.pageDetail.id')}</label>
									<p>{page.id}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="page-detail-field">
									<label>{t('pages.pageDetail.name')}</label>
									<p>{page.name}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="page-detail-field">
									<label>{t('pages.pageDetail.path')}</label>
									<p>{page.path}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="page-detail-field">
									<label>{t('pages.pageDetail.index')}</label>
									<p>{page.index}</p>
								</div>
							</Col>
							{page.description && (
								<Col xs={12}>
									<div className="page-detail-field">
										<label>{t('pages.pageDetail.description')}</label>
										<p>{page.description}</p>
									</div>
								</Col>
							)}
							{page.createdAt && (
								<Col xs={12} md={6}>
									<div className="page-detail-field">
										<label>{t('pages.pageDetail.createdAt')}</label>
										<p>{new Date(page.createdAt).toLocaleString()}</p>
									</div>
								</Col>
							)}
							{page.updatedAt && (
								<Col xs={12} md={6}>
									<div className="page-detail-field">
										<label>{t('pages.pageDetail.updatedAt')}</label>
										<p>{new Date(page.updatedAt).toLocaleString()}</p>
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
