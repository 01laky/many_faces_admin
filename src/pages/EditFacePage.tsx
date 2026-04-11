import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Row, Col } from 'react-bootstrap';
import { Button } from '../components/radix/Button';
import { FormField } from '../components/radix/FormField';
import { Input } from '../components/radix/Input';
import { GradientPicker } from '../components/GradientPicker';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import { useFace } from '../hooks/api/useFacesApi';
import { updateFace, type FaceVisibility } from '../hooks/api/useFacesApi';
import { PagesTable } from '../components/PagesTable';
import { toast } from 'react-toastify';
import './FaceFormPage.scss';

interface EditFaceFormData {
	index: string;
	title: string;
	description?: string;
	gradientSettings?: string;
	isPublic: boolean;
	visibility: FaceVisibility;
	allowRecensions: boolean;
}

export function EditFacePage() {
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const queryClient = useQueryClient();

	const faceId = id ? parseInt(id, 10) : 0;
	const { data: face, isLoading, error } = useFace(faceId);

	// Validation schema
	const validationSchema = yup.object({
		index: yup
			.string()
			.required(t('pages.editFace.validation.indexRequired'))
			.max(100, t('pages.editFace.validation.indexMaxLength')),
		title: yup
			.string()
			.required(t('pages.editFace.validation.titleRequired'))
			.max(200, t('pages.editFace.validation.titleMaxLength')),
		description: yup
			.string()
			.optional()
			.max(1000, t('pages.editFace.validation.descriptionMaxLength')),
		gradientSettings: yup.string().optional(),
		isPublic: yup.boolean().required().default(true),
		visibility: yup
			.mixed<FaceVisibility>()
			.oneOf(['Public', 'Private', 'Face', 'Hidden'])
			.required(),
		allowRecensions: yup.boolean().required().default(false),
	});

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<EditFaceFormData>({
		resolver: yupResolver(validationSchema),
		defaultValues: {
			index: '',
			title: '',
			description: '',
			gradientSettings: '',
			isPublic: true,
			visibility: 'Public',
			allowRecensions: false,
		},
	});

	// Reset form when face data loads
	useEffect(() => {
		if (face) {
			reset({
				index: face.index || '',
				title: face.title || '',
				description: face.description || '',
				gradientSettings: face.gradientSettings || '',
				isPublic: face.isPublic ?? true,
				visibility: (face.visibility as FaceVisibility) || 'Public',
				allowRecensions: face.allowRecensions ?? false,
			});
		}
	}, [face, reset]);

	/*
	 * React Hook Form exposes `watch` as a function tied to internal subscriptions. React Compiler
	 * treats that API as `react-hooks/incompatible-library` because memoizing a hook that returns such
	 * a function could freeze subscribed field values across renders.
	 *
	 * Here `gradientValue` only drives the gradient preview in this page; we do not forward `watch`
	 * into memoized children, so subscribing via `watch('gradientSettings')` is the supported RHF
	 * pattern and the warning is suppressed with an explicit rationale.
	 */
	// eslint-disable-next-line react-hooks/incompatible-library -- RHF watch(); rationale in block comment above
	const gradientValue = watch('gradientSettings');

	const handleGradientChange = useCallback(
		(val: string) => {
			setValue('gradientSettings', val, { shouldDirty: true });
		},
		[setValue]
	);

	const updateFaceMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: Partial<EditFaceFormData> }) =>
			updateFace(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['faces'] });
			queryClient.invalidateQueries({ queryKey: ['face', faceId] });
			toast.success(t('pages.editFace.success'));
			navigate(getLocalizedPath('/faces'));
		},
		onError: (error: Error) => {
			toast.error(error.message || t('pages.editFace.error'));
		},
	});

	const onSubmit = async (data: EditFaceFormData) => {
		if (!faceId) return;
		updateFaceMutation.mutate({ id: faceId, data });
	};

	if (isLoading) {
		return (
			<div
				className="face-form-page-wrapper"
				style={{
					padding: '2rem',
				}}
			>
				<Container fluid>
					<div className="face-form-loading">
						<p>{t('pages.editFace.loading')}</p>
					</div>
				</Container>
			</div>
		);
	}

	if (error || !face) {
		return (
			<div
				className="face-form-page-wrapper"
				style={{
					padding: '2rem',
				}}
			>
				<Container fluid>
					<div className="face-form-error">
						<p>{t('pages.editFace.error')}</p>
						<Button onClick={() => navigate(getLocalizedPath('/faces'))}>{t('common.back')}</Button>
					</div>
				</Container>
			</div>
		);
	}

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
						<h1>{t('pages.editFace.title')}</h1>
					</div>

					<div className="face-form-card">
						<form onSubmit={handleSubmit(onSubmit)} className="face-form">
							<Row>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.editFace.index')}
										error={errors.index?.message}
										required
									>
										<Input
											type="text"
											{...register('index')}
											placeholder={t('pages.editFace.indexPlaceholder')}
											disabled={isSubmitting}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.editFace.title')}
										error={errors.title?.message}
										required
									>
										<Input
											type="text"
											{...register('title')}
											placeholder={t('pages.editFace.titlePlaceholder')}
											disabled={isSubmitting}
										/>
									</FormField>
								</Col>
								<Col xs={12}>
									<FormField
										label={t('pages.editFace.description')}
										error={errors.description?.message}
									>
										<Input
											type="text"
											{...register('description')}
											placeholder={t('pages.editFace.descriptionPlaceholder')}
											disabled={isSubmitting}
										/>
									</FormField>
								</Col>
								<Col xs={12}>
									<FormField label={t('pages.editFace.gradient.title')}>
										<GradientPicker
											value={gradientValue}
											onChange={handleGradientChange}
											disabled={isSubmitting}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField label={t('pages.editFace.isPublic')}>
										<div className="form-check form-switch mt-2">
											<input
												type="checkbox"
												className="form-check-input"
												id="isPublic"
												{...register('isPublic')}
												disabled={isSubmitting}
											/>
											<label className="form-check-label" htmlFor="isPublic">
												{t('pages.editFace.isPublicHelp')}
											</label>
										</div>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField label={t('pages.editFace.visibility', 'Profile visibility')}>
										<select
											className="form-select"
											{...register('visibility')}
											disabled={isSubmitting}
										>
											<option value="Public">Public</option>
											<option value="Private">Private</option>
											<option value="Face">Face (members)</option>
											<option value="Hidden">Hidden</option>
										</select>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField label={t('pages.editFace.allowRecensions', 'Allow reviews')}>
										<div className="form-check form-switch mt-2">
											<input
												type="checkbox"
												className="form-check-input"
												id="allowRecensions"
												{...register('allowRecensions')}
												disabled={isSubmitting}
											/>
											<label className="form-check-label" htmlFor="allowRecensions">
												{t('pages.editFace.allowRecensionsHelp', 'Users can write star reviews')}
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
									{isSubmitting ? t('pages.editFace.submitting') : t('pages.editFace.submit')}
								</Button>
							</div>
						</form>
					</div>

					{/* Pages management section */}
					<div className="face-pages-section mt-4">
						<PagesTable faceId={faceId} />
					</div>
				</div>
			</Container>
		</div>
	);
}
