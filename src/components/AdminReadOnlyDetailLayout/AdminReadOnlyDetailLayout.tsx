import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/radix/Button';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import './AdminReadOnlyDetailLayout.scss';

export interface DetailField {
	label: string;
	value: ReactNode;
}

interface AdminReadOnlyDetailLayoutProps {
	title: string;
	backFaceId: number;
	fields: DetailField[];
	isLoading?: boolean;
	isError?: boolean;
	errorMessage?: string;
}

export function AdminReadOnlyDetailLayout({
	title,
	backFaceId,
	fields,
	isLoading,
	isError,
	errorMessage,
}: AdminReadOnlyDetailLayoutProps) {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();

	if (isLoading) {
		return (
			<Container fluid className="admin-readonly-detail">
				<p>{t('common.loading')}</p>
			</Container>
		);
	}

	if (isError) {
		return (
			<Container fluid className="admin-readonly-detail">
				<p>{errorMessage ?? t('common.error')}</p>
				<Button onClick={() => navigate(getLocalizedPath(`/faces/${backFaceId}`))}>
					{t('common.back')}
				</Button>
			</Container>
		);
	}

	return (
		<Container fluid className="admin-readonly-detail">
			<div className="admin-readonly-detail__header">
				<Button
					variant="outline"
					onClick={() => navigate(getLocalizedPath(`/faces/${backFaceId}`))}
				>
					{t('common.back')}
				</Button>
				<h1>{title}</h1>
			</div>
			<div className="admin-readonly-detail__grid">
				{fields.map((f) => (
					<div key={f.label} className="admin-readonly-detail__field">
						<label>{f.label}</label>
						<div>{f.value ?? '—'}</div>
					</div>
				))}
			</div>
		</Container>
	);
}
