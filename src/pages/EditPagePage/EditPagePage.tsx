import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col } from 'react-bootstrap';
import { Button } from '@/components/radix/Button';
import { FormField } from '@/components/radix/FormField';
import { Input } from '@/components/radix/Input';
import { GridLayoutEditor } from '@/components/page-editor/GridLayoutEditor';
import type { GridSchema } from '@/components/page-editor/GridLayoutEditor';
import { ProfileDetailGridLayoutEditor } from '@/components/page-editor/profileDetail/ProfileDetailGridLayoutEditor';
import type { ProfileDetailGridSchema } from '@/components/page-editor/profileDetail/profileDetailGridTypes';
import {
	parseProfileDetailGridSchema,
	serializeProfileDetailGridSchema,
} from '@/components/page-editor/profileDetail/profileDetailGridSchemaUtils';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { usePage, useUpdatePage } from '@/hooks/api/usePagesApi';
import { usePageTypes } from '@/hooks/api/usePageTypesApi';
import {
	usePageRouteTranslations,
	useUpdatePageRouteTranslations,
	type PageRouteTranslationData,
} from '@/hooks/api/usePageRouteTranslationsApi';
import { toast } from 'react-toastify';
import '../../styles/forms/PageFormPage.scss';

interface EditPageFormData {
	pageTypeId: number;
	name: string;
	description?: string;
	path: string;
	index: number;
}

export function EditPagePage() {
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();

	const pageId = id ? parseInt(id, 10) : 0;
	const updatePageMutation = useUpdatePage();
	const updateTranslationsMutation = useUpdatePageRouteTranslations();
	const { data: page, isLoading, error } = usePage(pageId);
	const { data: pageTypes = [], isLoading: pageTypesLoading } = usePageTypes();
	const { data: routeTranslations = [] } = usePageRouteTranslations(pageId);

	// Grid schema state
	const [gridSchema, setGridSchema] = useState<GridSchema | null>(null);
	const [profileGridSchema, setProfileGridSchema] = useState<ProfileDetailGridSchema | null>(null);
	const [gridSchemaLoaded, setGridSchemaLoaded] = useState(false);

	const pageTypeIndex = useMemo(
		() => pageTypes.find((pt) => pt.id === page?.pageTypeId)?.index,
		[pageTypes, page?.pageTypeId]
	);
	const isProfileDetailTemplate = pageTypeIndex === 'profileDetail';

	const handleGridChange = useCallback((schema: GridSchema) => {
		setGridSchema(schema);
	}, []);

	const handleProfileGridChange = useCallback((schema: ProfileDetailGridSchema) => {
		setProfileGridSchema(schema);
	}, []);

	// Switching edit target must reload grid from API; otherwise stale layout leaks between pages.
	useEffect(() => {
		queueMicrotask(() => {
			setGridSchema(null);
			setProfileGridSchema(null);
			setGridSchemaLoaded(false);
		});
	}, [pageId]);

	// Supported languages for route translations
	const supportedLanguages = ['en', 'sk', 'cz', 'de', 'fr', 'it'];

	// Derive initial translations from API data
	const initialTranslations = useMemo(() => {
		const translationMap: Record<string, string> = {};
		for (const rt of routeTranslations) {
			translationMap[rt.languageCode] = rt.translatedRoute;
		}
		return translationMap;
	}, [routeTranslations]);

	const [translationEdits, setTranslationEdits] = useState<Record<string, string> | null>(null);

	// Merged translations: user edits on top of server data
	const translations = translationEdits ?? initialTranslations;

	// Validation schema
	const validationSchema = yup.object({
		pageTypeId: yup
			.number()
			.required(t('pages.editPage.validation.pageTypeIdRequired'))
			.positive(t('pages.editPage.validation.pageTypeIdRequired')),
		name: yup
			.string()
			.required(t('pages.editPage.validation.nameRequired'))
			.max(200, t('pages.editPage.validation.nameMaxLength')),
		description: yup
			.string()
			.optional()
			.max(1000, t('pages.editPage.validation.descriptionMaxLength')),
		path: yup
			.string()
			.required(t('pages.editPage.validation.pathRequired'))
			.max(500, t('pages.editPage.validation.pathMaxLength')),
		index: yup
			.number()
			.required(t('pages.editPage.validation.indexRequired'))
			.min(0, t('pages.editPage.validation.indexMin')),
	});

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<EditPageFormData>({
		resolver: yupResolver(validationSchema),
		defaultValues: {
			name: '',
			description: '',
			path: '',
			index: 0,
		},
	});

	// Reset form when page data loads (ignore stale `page` from keepPreviousData while another id is loading)
	useEffect(() => {
		if (!page || page.id !== pageId) return;

		reset({
			pageTypeId: page.pageTypeId || pageTypes[0]?.id || 0,
			name: page.name || '',
			description: page.description || '',
			path: page.path || '',
			index: page.index || 0,
		});
		// Load grid schema from page data (only once per page load)
		if (!gridSchemaLoaded) {
			queueMicrotask(() => {
				const ptIndex = pageTypes.find((pt) => pt.id === page.pageTypeId)?.index;
				if (ptIndex === 'profileDetail') {
					// Profile-detail pages use a stricter backend-validated schema than
					// generic pages. Parse through the helper so malformed persisted JSON
					// opens as the default layout and can be saved back in a valid shape.
					setProfileGridSchema(parseProfileDetailGridSchema(page.gridSchema));
				} else if (page.gridSchema) {
					try {
						setGridSchema(JSON.parse(page.gridSchema) as GridSchema);
					} catch {
						// Invalid JSON, ignore
					}
				}
				setGridSchemaLoaded(true);
			});
		}
	}, [page, pageId, pageTypes, reset, gridSchemaLoaded]);

	const onSubmit = async (data: EditPageFormData) => {
		if (!pageId) return;

		const translationData: PageRouteTranslationData[] = Object.entries(translations)
			.filter(([, value]) => value.trim() !== '')
			.map(([languageCode, translatedRoute]) => ({
				languageCode,
				translatedRoute: translatedRoute.trim(),
			}));

		try {
			await updateTranslationsMutation.mutateAsync({ pageId, data: translationData });
		} catch {
			toast.error(t('pages.editPage.translationsError'));
		}

		updatePageMutation.mutate(
			{
				id: pageId,
				data: {
					...data,
					gridSchema: isProfileDetailTemplate
						? serializeProfileDetailGridSchema(profileGridSchema)
						: gridSchema
							? JSON.stringify(gridSchema)
							: null,
				},
			},
			{
				onSuccess: () => {
					toast.success(t('pages.editPage.success'));
					if (page) {
						navigate(getLocalizedPath(`/faces/${page.faceId}`));
					} else {
						navigate(getLocalizedPath('/faces'));
					}
				},
				onError: (error: Error) => {
					toast.error(error.message || t('pages.editPage.error'));
				},
			}
		);
	};

	if (isLoading) {
		return (
			<div
				className="page-form-page-wrapper"
				style={{
					padding: '2rem',
				}}
			>
				<Container fluid>
					<div className="page-form-loading">
						<p>{t('pages.editPage.loading')}</p>
					</div>
				</Container>
			</div>
		);
	}

	if (error || !page) {
		return (
			<div
				className="page-form-page-wrapper"
				style={{
					padding: '2rem',
				}}
			>
				<Container fluid>
					<div className="page-form-error">
						<p>{t('pages.editPage.error')}</p>
						<Button onClick={() => navigate(getLocalizedPath('/faces'))}>{t('common.back')}</Button>
					</div>
				</Container>
			</div>
		);
	}

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
							onClick={() => navigate(getLocalizedPath(`/faces/${page.faceId}`))}
							className="back-button"
						>
							← {t('common.back')}
						</Button>
						<h1>
							{isProfileDetailTemplate
								? t('pages.profileDetailTemplate.editTitle')
								: t('pages.editPage.title')}
						</h1>
					</div>

					{isProfileDetailTemplate && (
						<p className="text-muted mb-3">{t('pages.profileDetailTemplate.banner')}</p>
					)}

					<div className="page-form-card">
						<form onSubmit={handleSubmit(onSubmit)} className="page-form">
							<Row>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.editPage.pageType')}
										error={errors.pageTypeId?.message}
										required
									>
										<select
											{...register('pageTypeId', { valueAsNumber: true })}
											className="form-select"
											disabled={
												updatePageMutation.isPending || pageTypesLoading || isProfileDetailTemplate
											}
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
									<FormField label={t('pages.editPage.name')} error={errors.name?.message} required>
										<Input
											type="text"
											{...register('name')}
											placeholder={t('pages.editPage.namePlaceholder')}
											disabled={updatePageMutation.isPending}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField label={t('pages.editPage.path')} error={errors.path?.message} required>
										<Input
											type="text"
											{...register('path')}
											placeholder={t('pages.editPage.pathPlaceholder')}
											disabled={updatePageMutation.isPending}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.editPage.index')}
										error={errors.index?.message}
										required
									>
										<Input
											type="number"
											{...register('index', { valueAsNumber: true })}
											placeholder={t('pages.editPage.indexPlaceholder')}
											disabled={updatePageMutation.isPending}
										/>
									</FormField>
								</Col>
								<Col xs={12}>
									<FormField
										label={t('pages.editPage.description')}
										error={errors.description?.message}
									>
										<Input
											type="text"
											{...register('description')}
											placeholder={t('pages.editPage.descriptionPlaceholder')}
											disabled={updatePageMutation.isPending}
										/>
									</FormField>
								</Col>
							</Row>

							{!isProfileDetailTemplate && (
								<div className="route-translations-section mt-4">
									<h3 className="mb-3">{t('pages.editPage.routeTranslations')}</h3>
									<p className="text-muted mb-3">{t('pages.editPage.routeTranslationsHelp')}</p>
									<Row>
										{supportedLanguages.map((lang) => (
											<Col xs={12} md={4} key={lang}>
												<FormField label={`${t(`language.${lang}`)} (${lang})`}>
													<Input
														type="text"
														value={translations[lang] || ''}
														onChange={(e) =>
															setTranslationEdits((prev) => ({
																...(prev ?? initialTranslations),
																[lang]: e.target.value,
															}))
														}
														placeholder={t('pages.editPage.routeTranslationPlaceholder')}
														disabled={updatePageMutation.isPending}
													/>
												</FormField>
											</Col>
										))}
									</Row>
								</div>
							)}

							<div className="grid-layout-section mt-4">
								<h3 className="mb-3">
									{isProfileDetailTemplate
										? t('pages.profileDetailTemplate.gridTitle')
										: t('pages.editPage.gridLayout.title')}
								</h3>
								<p className="text-muted mb-3">
									{isProfileDetailTemplate
										? t('pages.profileDetailTemplate.gridHelp')
										: t('pages.editPage.gridLayout.help')}
								</p>
								{isProfileDetailTemplate ? (
									<ProfileDetailGridLayoutEditor
										value={profileGridSchema}
										onChange={handleProfileGridChange}
									/>
								) : (
									<GridLayoutEditor value={gridSchema} onChange={handleGridChange} />
								)}
							</div>

							<div className="page-form-actions">
								<Button
									type="button"
									variant="outline"
									onClick={() => navigate(getLocalizedPath(`/faces/${page.faceId}`))}
									disabled={updatePageMutation.isPending}
								>
									{t('common.cancel')}
								</Button>
								<Button type="submit" disabled={updatePageMutation.isPending}>
									{updatePageMutation.isPending
										? t('pages.editPage.submitting')
										: t('pages.editPage.submit')}
								</Button>
							</div>
						</form>
					</div>
				</div>
			</Container>
		</div>
	);
}
