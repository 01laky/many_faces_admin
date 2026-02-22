import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { createPage, type CreatePageData } from '../hooks/api/usePagesApi';
import { usePageTypes } from '../hooks/api/usePageTypesApi';
import {
	updatePageRouteTranslations,
	type PageRouteTranslationData,
} from '../hooks/api/usePageRouteTranslationsApi';
import { toast } from 'react-toastify';
import './PageFormPage.scss';

interface CreatePageFormData {
	pageTypeId: number;
	name: string;
	description?: string;
	path: string;
	index: number;
}

export function CreatePagePage() {
	const { faceId } = useParams<{ faceId: string }>();
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const queryClient = useQueryClient();

	const faceIdNum = faceId ? parseInt(faceId, 10) : 0;

	// Fetch page types for dropdown
	const { data: pageTypes = [], isLoading: pageTypesLoading } = usePageTypes();

	// Supported languages for route translations
	const supportedLanguages = ['en', 'sk', 'cz'];
	const [translations, setTranslations] = useState<Record<string, string>>({});

	// Validation schema
	const validationSchema = yup.object({
		pageTypeId: yup
			.number()
			.required(t('pages.createPage.validation.pageTypeIdRequired'))
			.positive(t('pages.createPage.validation.pageTypeIdRequired')),
		name: yup
			.string()
			.required(t('pages.createPage.validation.nameRequired'))
			.max(200, t('pages.createPage.validation.nameMaxLength')),
		description: yup
			.string()
			.optional()
			.max(1000, t('pages.createPage.validation.descriptionMaxLength')),
		path: yup
			.string()
			.required(t('pages.createPage.validation.pathRequired'))
			.max(500, t('pages.createPage.validation.pathMaxLength')),
		index: yup
			.number()
			.required(t('pages.createPage.validation.indexRequired'))
			.min(0, t('pages.createPage.validation.indexMin')),
	});

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<CreatePageFormData>({
		resolver: yupResolver(validationSchema),
		defaultValues: {
			pageTypeId: pageTypes[0]?.id || 0,
			name: '',
			description: '',
			path: '',
			index: 0,
		},
	});

	const createPageMutation = useMutation({
		mutationFn: createPage,
		onSuccess: async (createdPage) => {
			// Save route translations for the newly created page
			const translationData: PageRouteTranslationData[] = Object.entries(translations)
				.filter(([, value]) => value.trim() !== '')
				.map(([languageCode, translatedRoute]) => ({
					languageCode,
					translatedRoute: translatedRoute.trim(),
				}));

			if (translationData.length > 0 && createdPage?.id) {
				try {
					await updatePageRouteTranslations(createdPage.id, translationData);
				} catch {
					toast.error(t('pages.createPage.translationsError'));
				}
			}

			queryClient.invalidateQueries({ queryKey: ['pages', { faceId: faceIdNum }] });
			queryClient.invalidateQueries({ queryKey: ['face', faceIdNum] });
			toast.success(t('pages.createPage.success'));
			navigate(getLocalizedPath(`/faces/${faceId}`));
		},
		onError: (error: Error) => {
			toast.error(error.message || t('pages.createPage.error'));
		},
	});

	const onSubmit = async (data: CreatePageFormData) => {
		if (!faceIdNum) return;
		createPageMutation.mutate({
			faceId: faceIdNum,
			...data,
		} as CreatePageData);
	};

	return (
		<div
			className="page-form-page-wrapper"
			style={{
				padding: '2rem',
			}}
		>
			<Container fluid>
				<div className="page-form-content">
					<div className="page-form-header">
						<Button
							variant="outline"
							onClick={() => navigate(getLocalizedPath(`/faces/${faceId}`))}
							className="back-button"
						>
							← {t('common.back')}
						</Button>
						<h1>{t('pages.createPage.title')}</h1>
					</div>

					<div className="page-form-card">
						<form onSubmit={handleSubmit(onSubmit)} className="page-form">
							<Row>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.createPage.pageType')}
										error={errors.pageTypeId?.message}
										required
									>
										<select
											{...register('pageTypeId', { valueAsNumber: true })}
											className="form-select"
											disabled={isSubmitting || pageTypesLoading}
											style={{
												width: '100%',
												padding: '0.5rem',
												fontSize: '1rem',
												border: '1px solid rgba(0, 0, 0, 0.2)',
												borderRadius: '0.25rem',
											}}
										>
											{pageTypesLoading ? (
												<option>Loading...</option>
											) : (
												pageTypes.map((pt) => (
													<option key={pt.id} value={pt.id}>
														{pt.index}
													</option>
												))
											)}
										</select>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.createPage.name')}
										error={errors.name?.message}
										required
									>
										<Input
											type="text"
											{...register('name')}
											placeholder={t('pages.createPage.namePlaceholder')}
											disabled={isSubmitting}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.createPage.path')}
										error={errors.path?.message}
										required
									>
										<Input
											type="text"
											{...register('path')}
											placeholder={t('pages.createPage.pathPlaceholder')}
											disabled={isSubmitting}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.createPage.index')}
										error={errors.index?.message}
										required
									>
										<Input
											type="number"
											{...register('index', { valueAsNumber: true })}
											placeholder={t('pages.createPage.indexPlaceholder')}
											disabled={isSubmitting}
										/>
									</FormField>
								</Col>
								<Col xs={12}>
									<FormField
										label={t('pages.createPage.description')}
										error={errors.description?.message}
									>
										<Input
											type="text"
											{...register('description')}
											placeholder={t('pages.createPage.descriptionPlaceholder')}
											disabled={isSubmitting}
										/>
									</FormField>
								</Col>
							</Row>

							{/* Route Translations Section */}
							<div className="route-translations-section mt-4">
								<h3 className="mb-3">{t('pages.createPage.routeTranslations')}</h3>
								<p className="text-muted mb-3">{t('pages.createPage.routeTranslationsHelp')}</p>
								<Row>
									{supportedLanguages.map((lang) => (
										<Col xs={12} md={4} key={lang}>
											<FormField label={`${t(`language.${lang}`)} (${lang})`}>
												<Input
													type="text"
													value={translations[lang] || ''}
													onChange={(e) =>
														setTranslations((prev) => ({
															...prev,
															[lang]: e.target.value,
														}))
													}
													placeholder={t('pages.createPage.routeTranslationPlaceholder')}
													disabled={isSubmitting}
												/>
											</FormField>
										</Col>
									))}
								</Row>
							</div>

							<div className="page-form-actions">
								<Button
									type="button"
									variant="outline"
									onClick={() => navigate(getLocalizedPath(`/faces/${faceId}`))}
									disabled={isSubmitting}
								>
									{t('common.cancel')}
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? t('pages.createPage.submitting') : t('pages.createPage.submit')}
								</Button>
							</div>
						</form>
					</div>
				</div>
			</Container>
		</div>
	);
}
