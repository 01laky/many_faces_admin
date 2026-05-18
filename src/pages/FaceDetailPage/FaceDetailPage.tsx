import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col } from 'react-bootstrap';
import { useFace } from '@/hooks/api/useFacesApi';
import { gradientPreviewStyle } from '@/utils/gradientPreview';
import { Button } from '@/components/radix/Button';
import { PagesTable } from '@/components/tables/PagesTable';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { isAdminScopeFace } from '@/utils/adminScopeFace';
import './FaceDetailPage.scss';

export function FaceDetailPage() {
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();

	const faceId = id ? parseInt(id, 10) : 0;
	const { data: face, isLoading, error } = useFace(faceId);

	if (isLoading) {
		return (
			<div
				className="face-detail-page-wrapper"
				style={{
					padding: '2rem',
				}}
			>
				<Container fluid>
					<div className="face-detail-loading">
						<p>{t('pages.faceDetail.loading')}</p>
					</div>
				</Container>
			</div>
		);
	}

	if (error || !face) {
		return (
			<div
				className="face-detail-page-wrapper"
				style={{
					padding: '2rem',
				}}
			>
				<Container fluid>
					<div className="face-detail-error">
						<p>{t('pages.faceDetail.error')}</p>
						<Button onClick={() => navigate(getLocalizedPath('/faces'))}>{t('common.back')}</Button>
					</div>
				</Container>
			</div>
		);
	}

	return (
		<div
			className="face-detail-page-wrapper"
			style={{
				padding: '2rem',
			}}
		>
			<Container fluid>
				<div className="face-detail-content">
					<div className="face-detail-header">
						<Button
							variant="outline"
							onClick={() => navigate(getLocalizedPath('/faces'))}
							className="back-button"
						>
							← {t('common.back')}
						</Button>
						<h1>{t('pages.faceDetail.pageHeading')}</h1>
						{!isAdminScopeFace(face) && (
							<Button onClick={() => navigate(getLocalizedPath(`/faces/${faceId}/edit`))}>
								{t('common.edit')}
							</Button>
						)}
						{!isAdminScopeFace(face) && (
							<Button
								variant="outline"
								onClick={() => navigate(getLocalizedPath(`/faces/${faceId}/wall-tickets`))}
							>
								{t('pages.faceDetail.wallTickets')}
							</Button>
						)}
					</div>

					<div className="face-detail-card">
						<Row>
							<Col xs={12} md={6}>
								<div className="face-detail-field">
									<label>{t('pages.faceDetail.id')}</label>
									<p>{face.id}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="face-detail-field">
									<label>{t('pages.faceDetail.index')}</label>
									<p>{face.index}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="face-detail-field">
									<label>{t('pages.faceDetail.faceTitle')}</label>
									<p>{face.title}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="face-detail-field">
									<label>{t('pages.faceDetail.isPublic')}</label>
									<p>
										<span
											className={`badge ${face.isPublic ? 'bg-success' : 'bg-warning text-dark'}`}
										>
											{face.isPublic ? t('pages.faceDetail.public') : t('pages.faceDetail.private')}
										</span>
									</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="face-detail-field">
									<label>{t('pages.faceDetail.faceVisibility')}</label>
									<p>{face.visibility ?? '—'}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="face-detail-field">
									<label>{t('pages.faceDetail.allowRecensions')}</label>
									<p>
										{face.allowRecensions ? t('pages.faceDetail.yes') : t('pages.faceDetail.no')}
									</p>
								</div>
							</Col>
							{face.description && (
								<Col xs={12} md={6}>
									<div className="face-detail-field">
										<label>{t('pages.faceDetail.description')}</label>
										<p>{face.description}</p>
									</div>
								</Col>
							)}
							{face.gradientSettings && (
								<Col xs={12} md={6}>
									<div className="face-detail-field">
										<label>{t('pages.faceDetail.gradient')}</label>
										<p>
											<span
												className="gradient-preview-swatch gradient-preview-swatch--large"
												style={gradientPreviewStyle(face.gradientSettings)}
											/>
										</p>
									</div>
								</Col>
							)}
							{face.createdAt && (
								<Col xs={12} md={6}>
									<div className="face-detail-field">
										<label>{t('pages.faceDetail.createdAt')}</label>
										<p>{new Date(face.createdAt).toLocaleString()}</p>
									</div>
								</Col>
							)}
							{face.updatedAt && (
								<Col xs={12} md={6}>
									<div className="face-detail-field">
										<label>{t('pages.faceDetail.updatedAt')}</label>
										<p>{new Date(face.updatedAt).toLocaleString()}</p>
									</div>
								</Col>
							)}
						</Row>
					</div>

					{/* Pages table */}
					<div className="face-detail-pages-section">
						<PagesTable faceId={face.id} />
					</div>
				</div>
			</Container>
		</div>
	);
}
