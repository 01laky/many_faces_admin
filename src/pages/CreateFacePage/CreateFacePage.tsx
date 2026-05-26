import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col } from 'react-bootstrap';
import { Button } from '@/components/radix/Button';
import { FormField } from '@/components/radix/FormField';
import { Input } from '@/components/radix/Input';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { useCreateFace, type CreateFaceData } from '@/hooks/api/useFacesApi';
import { toast } from 'react-toastify';
import '../../styles/forms/FaceFormPage.scss';
import type { CreateFaceFormData } from './types';

export function CreateFacePage() {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();

	// Validation schema
	const validationSchema = yup.object({
		index: yup
			.string()
			.required(t('pages.createFace.validation.indexRequired'))
			.max(100, t('pages.createFace.validation.indexMaxLength')),
		title: yup
			.string()
			.required(t('pages.createFace.validation.titleRequired'))
			.max(200, t('pages.createFace.validation.titleMaxLength')),
		description: yup
			.string()
			.optional()
			.max(1000, t('pages.createFace.validation.descriptionMaxLength')),
		isPublic: yup.boolean().required().default(true),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateFaceFormData>({
		resolver: yupResolver(validationSchema),
		defaultValues: {
			index: '',
			title: '',
			description: '',
			isPublic: true,
		},
	});

	const createFaceMutation = useCreateFace();

	const onSubmit = async (data: CreateFaceFormData) => {
		createFaceMutation.mutate(data as CreateFaceData, {
			onSuccess: () => {
				toast.success(t('pages.createFace.success'));
				navigate(getLocalizedPath('/faces'));
			},
			onError: (error: Error) => {
				toast.error(error.message || t('pages.createFace.error'));
			},
		});
	};

	return (
		<div
			className="face-form-page-wrapper"
			style={{
				padding: '2rem',
			}}
		>
			<Container fluid>
				<div className="face-form-content">
					<div className="face-form-header">
						<Button
							variant="outline"
							onClick={() => navigate(getLocalizedPath('/faces'))}
							className="back-button"
						>
							← {t('common.back')}
						</Button>
						<h1>{t('pages.createFace.title')}</h1>
					</div>

					<div className="face-form-card">
						<form onSubmit={handleSubmit(onSubmit)} className="face-form">
							<Row>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.createFace.index')}
										error={errors.index?.message}
										required
									>
										<Input
											type="text"
											{...register('index')}
											placeholder={t('pages.createFace.indexPlaceholder')}
											disabled={createFaceMutation.isPending}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.createFace.title')}
										error={errors.title?.message}
										required
									>
										<Input
											type="text"
											{...register('title')}
											placeholder={t('pages.createFace.titlePlaceholder')}
											disabled={createFaceMutation.isPending}
										/>
									</FormField>
								</Col>
								<Col xs={12}>
									<FormField
										label={t('pages.createFace.description')}
										error={errors.description?.message}
									>
										<Input
											type="text"
											{...register('description')}
											placeholder={t('pages.createFace.descriptionPlaceholder')}
											disabled={createFaceMutation.isPending}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField label={t('pages.createFace.isPublic')}>
										<div className="form-check form-switch mt-2">
											<input
												type="checkbox"
												className="form-check-input"
												id="isPublic"
												{...register('isPublic')}
												disabled={createFaceMutation.isPending}
											/>
											<label className="form-check-label" htmlFor="isPublic">
												{t('pages.createFace.isPublicHelp')}
											</label>
										</div>
									</FormField>
								</Col>
							</Row>

							<div className="face-form-actions">
								<Button
									type="button"
									variant="outline"
									onClick={() => navigate(getLocalizedPath('/faces'))}
									disabled={createFaceMutation.isPending}
								>
									{t('common.cancel')}
								</Button>
								<Button type="submit" disabled={createFaceMutation.isPending}>
									{createFaceMutation.isPending
										? t('pages.createFace.submitting')
										: t('pages.createFace.submit')}
								</Button>
							</div>
						</form>
					</div>
				</div>
			</Container>
		</div>
	);
}
