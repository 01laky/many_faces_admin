// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminProfilePage } from './AdminProfilePage';

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => vi.fn(),
	};
});

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, opts?: { email?: string }) => {
			if (key === 'pages.adminProfile.emailConfirm.banner') {
				return `Confirm ${opts?.email ?? ''}`;
			}
			const labels: Record<string, string> = {
				'pages.adminProfile.title': 'Admin profile',
				'pages.adminProfile.loading': 'Loading',
				'pages.adminProfile.error': 'Error',
				'pages.adminProfile.emailConfirmed': 'Confirmed',
				'pages.adminProfile.emailUnconfirmed': 'Unconfirmed',
				'pages.adminProfile.id': 'User ID',
				'pages.adminProfile.createdAt': 'Created',
				'pages.adminProfile.avatar.sectionTitle': 'Avatar',
				'pages.adminProfile.avatar.upload': 'Upload',
				'pages.adminProfile.identitySection': 'Identity',
				'pages.adminProfile.email': 'Email',
				'pages.adminProfile.firstName': 'First name',
				'pages.adminProfile.lastName': 'Last name',
				'pages.adminProfile.saveIdentity': 'Save',
				'pages.adminProfile.passwordSection': 'Password',
				'pages.adminProfile.currentPassword': 'Current',
				'pages.adminProfile.newPassword': 'New',
				'pages.adminProfile.confirmPassword': 'Confirm',
				'pages.adminProfile.changePassword': 'Change password',
				'pages.adminProfile.facesSection': 'Faces',
				'pages.adminProfile.facesSectionHint': 'All faces listed',
				'pages.adminProfile.selectFaceRole': 'Select role',
				'pages.adminProfile.notAssigned': 'Not assigned',
				'pages.adminProfile.emailConfirm.resend': 'Resend confirmation',
			};
			return labels[key] ?? key;
		},
	}),
}));

const profileWithUnassignedFace = {
	id: 'u1',
	email: 'pending@test.com',
	globalRole: { userRoleId: 1, name: 'SUPER_ADMIN' },
	emailConfirmed: false,
	faces: [
		{
			faceId: 2,
			faceIndex: 'demo',
			faceTitle: 'Demo',
			userRoleId: null,
			roleName: null,
			hasMembership: false,
			isActiveParticipant: false,
		},
	],
	createdAt: new Date().toISOString(),
};

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: () => ({
		user: { id: 'u1', email: 'admin@test.com' },
		logout: vi.fn(),
	}),
}));

vi.mock('@/hooks/useLocalizedLink', () => ({
	useLocalizedLink: () => (path: string) => `/en${path}`,
}));

vi.mock('@/hooks/api/useAdminMeProfileApi', () => ({
	useAdminMeProfile: () => ({
		data: profileWithUnassignedFace,
		isLoading: false,
		error: null,
	}),
	useAdminMeProfileMutations: () => ({
		updateProfile: { mutateAsync: vi.fn(), isPending: false },
		updatePassword: { mutateAsync: vi.fn(), isPending: false },
		patchFaceRole: { mutateAsync: vi.fn(), isPending: false },
		resendEmailConfirmation: { mutateAsync: vi.fn(), isPending: false },
		uploadAvatar: { mutateAsync: vi.fn(), isPending: false },
	}),
	useFaceRoles: () => ({ data: [{ id: 3, name: 'FACE_USER' }] }),
}));

describe('SAP-U10 unconfirmed email banner', () => {
	it('shows banner and resend when emailConfirmed is false', () => {
		render(
			<MemoryRouter>
				<AdminProfilePage />
			</MemoryRouter>
		);
		expect(screen.getByRole('status')).toHaveTextContent('Confirm pending@test.com');
		expect(screen.getByRole('button', { name: 'Resend confirmation' })).toBeTruthy();
	});
});

describe('SAP-U13 AdminProfilePage all-faces grid', () => {
	it('renders face role select for unassigned row instead of noFaces copy', () => {
		render(
			<MemoryRouter>
				<AdminProfilePage />
			</MemoryRouter>
		);
		expect(screen.queryByText('pages.adminProfile.noFaces')).toBeNull();
		expect(screen.getByRole('combobox')).toBeTruthy();
		expect(screen.getByText('Not assigned')).toBeTruthy();
		expect(screen.getByText('All faces listed')).toBeTruthy();
	});
});
