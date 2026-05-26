import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/radix/Button';
import { FormField } from '@/components/radix/FormField';
import { Input } from '@/components/radix/Input';
import {
	useAdminMeProfile,
	useAdminMeProfileMutations,
	useFaceRoles,
} from '@/hooks/api/useAdminMeProfileApi';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { persistStoredUserJson } from '@/utils/authStorage';
import { mergeStoredAdminUser } from '@/utils/adminProfileStoredUser';
import {
	validateAdminProfileEmail,
	adminProfilePasswordsMatch,
} from '@/utils/adminProfileFormValidation';
import { mutationErrorMessage } from '@/utils/operatorDetailFormat';
import { AdminProfileFacesTable } from './AdminProfileFacesTable';
import '../UserDetailPage/UserDetailPage.scss';
import './AdminProfilePage.scss';
import type { AdminProfileIdentityFormProps } from './types';

function AdminProfileIdentityForm({ profile, saving, onSave }: AdminProfileIdentityFormProps) {
	const { t } = useTranslation('common');
	const [email, setEmail] = useState(profile.email ?? '');
	const [firstName, setFirstName] = useState(profile.firstName ?? '');
	const [lastName, setLastName] = useState(profile.lastName ?? '');

	const handleSaveIdentity = async () => {
		const emailError = validateAdminProfileEmail(email);
		if (emailError === 'emailRequired') {
			toast.error(t('pages.adminProfile.validation.emailRequired'));
			return;
		}
		if (emailError === 'emailInvalid') {
			toast.error(t('pages.adminProfile.validation.emailInvalid'));
			return;
		}
		await onSave({
			email: email.trim(),
			firstName: firstName.trim() || null,
			lastName: lastName.trim() || null,
		});
	};

	return (
		<div className="user-detail-card">
			<h2 className="admin-profile-section-title">{t('pages.adminProfile.identitySection')}</h2>
			<Row className="g-3">
				<Col xs={12} md={6}>
					<FormField label={t('pages.adminProfile.email')} htmlFor="admin-profile-email">
						<Input
							id="admin-profile-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</FormField>
				</Col>
				<Col xs={12} md={6}>
					<FormField label={t('pages.adminProfile.firstName')} htmlFor="admin-profile-first">
						<Input
							id="admin-profile-first"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
						/>
					</FormField>
				</Col>
				<Col xs={12} md={6}>
					<FormField label={t('pages.adminProfile.lastName')} htmlFor="admin-profile-last">
						<Input
							id="admin-profile-last"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
						/>
					</FormField>
				</Col>
			</Row>
			<div className="admin-profile-actions">
				<Button onClick={() => void handleSaveIdentity()} disabled={saving}>
					{t('pages.adminProfile.saveIdentity')}
				</Button>
			</div>
		</div>
	);
}

export function AdminProfilePage() {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const { user, logout } = useAuth();
	const { data: profile, isLoading, error } = useAdminMeProfile();
	const { data: faceRoles = [] } = useFaceRoles();
	const { updateProfile, updatePassword, patchFaceRole, resendEmailConfirmation, uploadAvatar } =
		useAdminMeProfileMutations();

	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const avatarInputRef = useRef<HTMLInputElement>(null);

	const patchStoredUser = (next: { email?: string; firstName?: string; lastName?: string }) => {
		if (!user) return;
		persistStoredUserJson(JSON.stringify(mergeStoredAdminUser(user, next)));
	};

	const handleSaveIdentity = async (body: {
		email: string;
		firstName: string | null;
		lastName: string | null;
	}) => {
		try {
			const updated = await updateProfile.mutateAsync(body);
			patchStoredUser({
				email: updated.email,
				firstName: updated.firstName ?? undefined,
				lastName: updated.lastName ?? undefined,
			});
			toast.success(t('pages.adminProfile.saveSuccess'));
			if (!updated.emailConfirmed) {
				toast.info(t('pages.adminProfile.emailConfirm.banner', { email: updated.email }));
			}
		} catch (e) {
			toast.error(mutationErrorMessage(e));
		}
	};

	const handleChangePassword = async () => {
		if (!adminProfilePasswordsMatch(newPassword, confirmPassword)) {
			toast.error(t('pages.adminProfile.validation.passwordMismatch'));
			return;
		}
		try {
			await updatePassword.mutateAsync({ currentPassword, newPassword, confirmPassword });
			toast.success(t('pages.adminProfile.passwordSuccess'));
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
			await logout();
			navigate(getLocalizedPath('/login'), { replace: true });
		} catch (e) {
			toast.error(mutationErrorMessage(e));
		}
	};

	const handleRoleChange = async (faceId: number, userRoleId: number) => {
		try {
			await patchFaceRole.mutateAsync({ faceId, userRoleId });
			toast.success(t('pages.adminProfile.roleSuccess'));
		} catch (e) {
			toast.error(mutationErrorMessage(e));
		}
	};

	const handleAvatarChange = async (file: File | undefined) => {
		if (!file) return;
		try {
			await uploadAvatar.mutateAsync(file);
			toast.success(t('pages.adminProfile.avatar.success'));
		} catch (e) {
			toast.error(mutationErrorMessage(e));
		}
	};

	const handleResendConfirm = async () => {
		try {
			await resendEmailConfirmation.mutateAsync();
			toast.success(t('pages.adminProfile.emailConfirm.resendSuccess'));
		} catch (e) {
			toast.error(mutationErrorMessage(e));
		}
	};

	if (isLoading) {
		return (
			<div className="user-detail-page-wrapper admin-profile-page" style={{ padding: '2rem' }}>
				<Container fluid>
					<p>{t('pages.adminProfile.loading')}</p>
				</Container>
			</div>
		);
	}

	if (error || !profile) {
		return (
			<div className="user-detail-page-wrapper admin-profile-page" style={{ padding: '2rem' }}>
				<Container fluid>
					<p>{t('pages.adminProfile.error')}</p>
				</Container>
			</div>
		);
	}

	const avatarInitial = (profile.email ?? user?.email ?? '?').charAt(0).toUpperCase();

	return (
		<div className="user-detail-page-wrapper admin-profile-page" style={{ padding: '2rem' }}>
			<Container fluid>
				<div className="user-detail-content">
					<div className="user-detail-header">
						<h1>{t('pages.adminProfile.title')}</h1>
					</div>

					{!profile.emailConfirmed && (
						<div className="admin-profile-email-banner" role="status">
							<p>{t('pages.adminProfile.emailConfirm.banner', { email: profile.email })}</p>
							<Button
								variant="outline"
								size="sm"
								onClick={() => void handleResendConfirm()}
								disabled={resendEmailConfirmation.isPending}
							>
								{t('pages.adminProfile.emailConfirm.resend')}
							</Button>
						</div>
					)}

					<div className="user-detail-card">
						<div className="user-detail-badges">
							<span className="user-detail-badge">{profile.globalRole.name}</span>
							<span className="user-detail-badge">
								{profile.emailConfirmed
									? t('pages.adminProfile.emailConfirmed')
									: t('pages.adminProfile.emailUnconfirmed')}
							</span>
						</div>
						<Row>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.adminProfile.id')}</label>
									<p>{profile.id}</p>
								</div>
							</Col>
							<Col xs={12} md={6}>
								<div className="user-detail-field">
									<label>{t('pages.adminProfile.createdAt')}</label>
									<p>{profile.createdAt ? new Date(profile.createdAt).toLocaleString() : '—'}</p>
								</div>
							</Col>
						</Row>
					</div>

					<div className="user-detail-card admin-profile-avatar-card">
						<h2 className="admin-profile-section-title">
							{t('pages.adminProfile.avatar.sectionTitle')}
						</h2>
						<div className="admin-profile-avatar-row">
							{profile.globalAvatarUrl ? (
								<img src={profile.globalAvatarUrl} alt="" className="admin-profile-avatar-image" />
							) : (
								<span className="admin-profile-avatar-fallback" aria-hidden>
									{avatarInitial}
								</span>
							)}
							<input
								ref={avatarInputRef}
								type="file"
								accept="image/jpeg,image/png,image/gif,image/webp"
								className="admin-profile-avatar-input"
								onChange={(e) => void handleAvatarChange(e.target.files?.[0])}
							/>
							<Button
								variant="outline"
								onClick={() => avatarInputRef.current?.click()}
								disabled={uploadAvatar.isPending}
							>
								{uploadAvatar.isPending
									? t('pages.adminProfile.avatar.uploading')
									: t('pages.adminProfile.avatar.upload')}
							</Button>
						</div>
					</div>

					<AdminProfileIdentityForm
						key={`${profile.email}-${profile.firstName ?? ''}-${profile.lastName ?? ''}`}
						profile={profile}
						saving={updateProfile.isPending}
						onSave={handleSaveIdentity}
					/>

					<div className="user-detail-card">
						<h2 className="admin-profile-section-title">
							{t('pages.adminProfile.passwordSection')}
						</h2>
						<Row className="g-3">
							<Col xs={12} md={4}>
								<FormField
									label={t('pages.adminProfile.currentPassword')}
									htmlFor="admin-profile-current-pw"
								>
									<Input
										id="admin-profile-current-pw"
										type="password"
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										autoComplete="current-password"
									/>
								</FormField>
							</Col>
							<Col xs={12} md={4}>
								<FormField
									label={t('pages.adminProfile.newPassword')}
									htmlFor="admin-profile-new-pw"
								>
									<Input
										id="admin-profile-new-pw"
										type="password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										autoComplete="new-password"
									/>
								</FormField>
							</Col>
							<Col xs={12} md={4}>
								<FormField
									label={t('pages.adminProfile.confirmPassword')}
									htmlFor="admin-profile-confirm-pw"
								>
									<Input
										id="admin-profile-confirm-pw"
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										autoComplete="new-password"
									/>
								</FormField>
							</Col>
						</Row>
						<div className="admin-profile-actions">
							<Button
								variant="outline"
								onClick={() => void handleChangePassword()}
								disabled={updatePassword.isPending}
							>
								{t('pages.adminProfile.changePassword')}
							</Button>
						</div>
					</div>

					<div className="user-detail-card">
						<h2 className="admin-profile-section-title">{t('pages.adminProfile.facesSection')}</h2>
						<AdminProfileFacesTable
							faces={profile.faces}
							faceRoles={faceRoles}
							onRoleChange={(faceId, roleId) => void handleRoleChange(faceId, roleId)}
							roleChangePending={patchFaceRole.isPending}
						/>
					</div>
				</div>
			</Container>
		</div>
	);
}
