import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/radix/Button';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import './AdminReadOnlyDetailLayout.scss';
import type { AdminReadOnlyDetailLayoutProps } from './types';

export function AdminReadOnlyDetailLayout({
	title,
	backFaceId,
	fields = [],
	beforeFields,
	hideTitle = false,
	className,
	isLoading,
	isError,
	errorMessage,
}: AdminReadOnlyDetailLayoutProps) {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const rootClass = ['admin-readonly-detail', className].filter(Boolean).join(' ');

	if (isLoading) {
		return (
			<Container fluid className={rootClass}>
				<p>{t('common.loading')}</p>
			</Container>
		);
	}

	if (isError) {
		return (
			<Container fluid className={rootClass}>
				<p>{errorMessage ?? t('common.error')}</p>
				<Button onClick={() => navigate(getLocalizedPath(`/faces/${backFaceId}`))}>
					{t('common.back')}
				</Button>
			</Container>
		);
	}

	return (
		<Container fluid className={rootClass}>
			<div className="admin-readonly-detail__header">
				<button
					type="button"
					className="btn btn-outline-secondary btn-sm admin-readonly-detail__back"
					onClick={() => navigate(getLocalizedPath(`/faces/${backFaceId}`))}
				>
					{t('common.back')}
				</button>
				{!hideTitle && title ? <h1 className="admin-readonly-detail__title">{title}</h1> : null}
			</div>
			<div className="admin-readonly-detail__body">{beforeFields}</div>
			{fields.length > 0 ? (
				<section className="admin-readonly-detail__card">
					<dl className="admin-readonly-detail__grid">
						{fields.map((f) => (
							<div key={f.label} className="admin-readonly-detail__field">
								<dt>{f.label}</dt>
								<dd>{f.value ?? '—'}</dd>
							</div>
						))}
					</dl>
				</section>
			) : null}
		</Container>
	);
}
