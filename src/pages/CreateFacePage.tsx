import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Row, Col } from 'react-bootstrap';
import { Button } from '../components/radix/Button';
import { FormField } from '../components/radix/FormField';
import { Input } from '../components/radix/Input';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import { createFace, type CreateFaceData } from '../hooks/api/useFacesApi';
import { toast } from 'react-toastify';
import './FaceFormPage.scss';

interface CreateFaceFormData {
	index: string;
	title: string;
	description?: string;
	color?: string;
	isPublic: boolean;
}

export function CreateFacePage() {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const queryClient = useQueryClient();

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
		color: yup.string().optional().max(50, t('pages.createFace.validation.colorMaxLength')),
		isPublic: yup.boolean().required().default(true),
	});

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<CreateFaceFormData>({
		resolver: yupResolver(validationSchema),
		defaultValues: {
			index: '',
			title: '',
			description: '',
			color: '',
			isPublic: true,
		},
	});

	const createFaceMutation = useMutation({
		mutationFn: createFace,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['faces'] });
			toast.success(t('pages.createFace.success'));
			navigate(getLocalizedPath('/faces'));
		},
		onError: (error: Error) => {
			toast.error(error.message || t('pages.createFace.error'));
		},
	});

	const onSubmit = async (data: CreateFaceFormData) => {
		createFaceMutation.mutate(data as CreateFaceData);
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
											disabled={isSubmitting}
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
											disabled={isSubmitting}
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
											disabled={isSubmitting}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField label={t('pages.createFace.color')} error={errors.color?.message}>
										<Input
											type="text"
											{...register('color')}
											placeholder={t('pages.createFace.colorPlaceholder')}
											disabled={isSubmitting}
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
												disabled={isSubmitting}
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
									disabled={isSubmitting}
								>
									{t('common.cancel')}
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? t('pages.createFace.submitting') : t('pages.createFace.submit')}
								</Button>
							</div>
						</form>
					</div>
				</div>
			</Container>
		</div>
	);
}
