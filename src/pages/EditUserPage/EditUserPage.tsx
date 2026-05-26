import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col } from 'react-bootstrap';
import { Button } from '@/components/radix/Button';
import { FormField } from '@/components/radix/FormField';
import { Input } from '@/components/radix/Input';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { useUser, useUpdateUser } from '@/hooks/api/useUsersApi';
import { toast } from 'react-toastify';
import '../../styles/forms/UserFormPage.scss';
import type { EditUserFormData } from './types';

export function EditUserPage() {
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const { data: user, isLoading, error } = useUser(id || '');
	const updateUserMutation = useUpdateUser();

	// Validation schema
	const validationSchema = yup.object({
		email: yup
			.string()
			.required(t('pages.editUser.validation.emailRequired'))
			.email(t('pages.editUser.validation.emailInvalid')),
		password: yup.string().optional().min(4, t('pages.editUser.validation.passwordMinLength')),
		confirmPassword: yup
			.string()
			.optional()
			.when('password', {
				is: (value: string) => value && value.length > 0,
				then: (schema) => schema.required(t('pages.editUser.validation.confirmPasswordRequired')),
				otherwise: (schema) => schema.optional(),
			})
			.oneOf([yup.ref('password')], t('pages.editUser.validation.passwordsMatch')),
		firstName: yup.string().optional(),
		lastName: yup.string().optional(),
	});

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<EditUserFormData>({
		resolver: yupResolver(validationSchema),
		defaultValues: {
			email: '',
			firstName: '',
			lastName: '',
			password: '',
			confirmPassword: '',
		},
	});

	// Reset form when user data loads
	useEffect(() => {
		if (user) {
			reset({
				email: user.email || '',
				firstName: user.firstName || '',
				lastName: user.lastName || '',
				password: '',
				confirmPassword: '',
			});
		}
	}, [user, reset]);

	const onSubmit = async (data: EditUserFormData) => {
		if (!id) return;

		const { confirmPassword: _confirmPassword, password, ...updateData } = data;
		const finalData = password ? { ...updateData, password } : updateData;

		updateUserMutation.mutate(
			{ id, data: finalData },
			{
				onSuccess: () => {
					toast.success(t('pages.editUser.success'));
					navigate(getLocalizedPath('/users'));
				},
				onError: (error: Error) => {
					toast.error(error.message || t('pages.editUser.error'));
				},
			}
		);
	};

	if (isLoading) {
		return (
			<div
				className="user-form-page-wrapper"
				style={{
					padding: '2rem',
				}}
			>
				<Container fluid>
					<div className="user-form-loading">
						<p>{t('pages.editUser.loading')}</p>
					</div>
				</Container>
			</div>
		);
	}

	if (error || !user) {
		return (
			<div
				className="user-form-page-wrapper"
				style={{
					padding: '2rem',
				}}
			>
				<Container fluid>
					<div className="user-form-error">
						<p>{t('pages.editUser.error')}</p>
						<Button onClick={() => navigate(getLocalizedPath('/users'))}>{t('common.back')}</Button>
					</div>
				</Container>
			</div>
		);
	}

	return (
		<div
			className="user-form-page-wrapper"
			style={{
				padding: '2rem',
			}}
		>
			<Container fluid>
				<div className="user-form-content">
					<div className="user-form-header">
						<Button
							variant="outline"
							onClick={() => navigate(getLocalizedPath('/users'))}
							className="back-button"
						>
							← {t('common.back')}
						</Button>
						<h1>{t('pages.editUser.title')}</h1>
					</div>

					<div className="user-form-card">
						<form onSubmit={handleSubmit(onSubmit)} className="user-form">
							<Row>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.editUser.email')}
										error={errors.email?.message}
										required
									>
										<Input
											type="email"
											{...register('email')}
											placeholder={t('pages.editUser.emailPlaceholder')}
											disabled={updateUserMutation.isPending}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.editUser.firstName')}
										error={errors.firstName?.message}
									>
										<Input
											type="text"
											{...register('firstName')}
											placeholder={t('pages.editUser.firstNamePlaceholder')}
											disabled={updateUserMutation.isPending}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField label={t('pages.editUser.lastName')} error={errors.lastName?.message}>
										<Input
											type="text"
											{...register('lastName')}
											placeholder={t('pages.editUser.lastNamePlaceholder')}
											disabled={updateUserMutation.isPending}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.editUser.password')}
										error={errors.password?.message}
										helpText={t('pages.editUser.passwordHelp')}
									>
										<Input
											type="password"
											{...register('password')}
											placeholder={t('pages.editUser.passwordPlaceholder')}
											disabled={updateUserMutation.isPending}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.editUser.confirmPassword')}
										error={errors.confirmPassword?.message}
									>
										<Input
											type="password"
											{...register('confirmPassword')}
											placeholder={t('pages.editUser.confirmPasswordPlaceholder')}
											disabled={updateUserMutation.isPending}
										/>
									</FormField>
								</Col>
							</Row>

							<div className="user-form-actions">
								<Button
									type="button"
									variant="outline"
									onClick={() => navigate(getLocalizedPath('/users'))}
									disabled={updateUserMutation.isPending}
								>
									{t('common.cancel')}
								</Button>
								<Button type="submit" disabled={updateUserMutation.isPending}>
									{updateUserMutation.isPending
										? t('pages.editUser.submitting')
										: t('pages.editUser.submit')}
								</Button>
							</div>
						</form>
					</div>
				</div>
			</Container>
		</div>
	);
}
