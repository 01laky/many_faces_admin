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
import { createUser } from '../hooks/api/useUsersApi';
import { toast } from 'react-toastify';
import './UserFormPage.scss';

interface CreateUserFormData {
	email: string;
	password: string;
	confirmPassword: string;
	firstName?: string;
	lastName?: string;
}

export function CreateUserPage() {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const queryClient = useQueryClient();

	// Validation schema
	const validationSchema = yup.object({
		email: yup
			.string()
			.required(t('pages.createUser.validation.emailRequired'))
			.email(t('pages.createUser.validation.emailInvalid')),
		password: yup
			.string()
			.required(t('pages.createUser.validation.passwordRequired'))
			.min(4, t('pages.createUser.validation.passwordMinLength')),
		confirmPassword: yup
			.string()
			.required(t('pages.createUser.validation.confirmPasswordRequired'))
			.oneOf([yup.ref('password')], t('pages.createUser.validation.passwordsMatch')),
		firstName: yup.string().optional(),
		lastName: yup.string().optional(),
	});

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<CreateUserFormData>({
		resolver: yupResolver(validationSchema),
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: '',
			firstName: '',
			lastName: '',
		},
	});

	const createUserMutation = useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			toast.success(t('pages.createUser.success'));
			navigate(getLocalizedPath('/users'));
		},
		onError: (error: Error) => {
			toast.error(error.message || t('pages.createUser.error'));
		},
	});

	const onSubmit = async (data: CreateUserFormData) => {
		const { confirmPassword: _confirmPassword, ...userData } = data;
		createUserMutation.mutate(userData as CreateUserData);
	};

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
						<h1>{t('pages.createUser.title')}</h1>
					</div>

					<div className="user-form-card">
						<form onSubmit={handleSubmit(onSubmit)} className="user-form">
							<Row>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.createUser.email')}
										error={errors.email?.message}
										required
									>
										<Input
											type="email"
											{...register('email')}
											placeholder={t('pages.createUser.emailPlaceholder')}
											disabled={isSubmitting}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.createUser.firstName')}
										error={errors.firstName?.message}
									>
										<Input
											type="text"
											{...register('firstName')}
											placeholder={t('pages.createUser.firstNamePlaceholder')}
											disabled={isSubmitting}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.createUser.lastName')}
										error={errors.lastName?.message}
									>
										<Input
											type="text"
											{...register('lastName')}
											placeholder={t('pages.createUser.lastNamePlaceholder')}
											disabled={isSubmitting}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.createUser.password')}
										error={errors.password?.message}
										required
									>
										<Input
											type="password"
											{...register('password')}
											placeholder={t('pages.createUser.passwordPlaceholder')}
											disabled={isSubmitting}
										/>
									</FormField>
								</Col>
								<Col xs={12} md={6}>
									<FormField
										label={t('pages.createUser.confirmPassword')}
										error={errors.confirmPassword?.message}
										required
									>
										<Input
											type="password"
											{...register('confirmPassword')}
											placeholder={t('pages.createUser.confirmPasswordPlaceholder')}
											disabled={isSubmitting}
										/>
									</FormField>
								</Col>
							</Row>

							<div className="user-form-actions">
								<Button
									type="button"
									variant="outline"
									onClick={() => navigate(getLocalizedPath('/users'))}
									disabled={isSubmitting}
								>
									{t('common.cancel')}
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? t('pages.createUser.submitting') : t('pages.createUser.submit')}
								</Button>
							</div>
						</form>
					</div>
				</div>
			</Container>
		</div>
	);
}
