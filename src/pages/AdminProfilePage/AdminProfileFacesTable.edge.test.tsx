// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminProfileFacesTable } from './AdminProfileFacesTable';
import type { AdminMeFaceRow } from '@/api/adminMeProfileApiClient';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

const unassignedFace: AdminMeFaceRow = {
	faceId: 2,
	faceIndex: 'demo',
	faceTitle: 'Demo Face',
	userRoleId: null,
	roleName: null,
	hasMembership: false,
	isActiveParticipant: false,
};

const assignedFace: AdminMeFaceRow = {
	faceId: 1,
	faceIndex: 'admin',
	faceTitle: 'Admin',
	userRoleId: 5,
	roleName: 'FACE_ADMIN',
	hasMembership: true,
	isActiveParticipant: true,
};

describe('SAP-U11 AdminProfileFacesTable unassigned row', () => {
	it('renders role select without noFaces empty state', () => {
		render(
			<MemoryRouter>
				<AdminProfileFacesTable
					faces={[unassignedFace]}
					faceRoles={[{ id: 3, name: 'FACE_USER' }]}
					onRoleChange={vi.fn()}
					pendingFaceId={null}
					getLocalizedPath={(p) => p}
				/>
			</MemoryRouter>
		);

		expect(screen.queryByText('pages.adminProfile.noFaces')).toBeNull();
		expect(screen.getByRole('combobox')).toBeTruthy();
		expect(screen.getByText('pages.adminProfile.notAssigned')).toBeTruthy();
	});
});

describe('SAP-U11 AdminProfileFacesTable assigned row status', () => {
	it('shows active participant badge when assigned', () => {
		render(
			<MemoryRouter>
				<AdminProfileFacesTable
					faces={[assignedFace]}
					faceRoles={[{ id: 5, name: 'FACE_ADMIN' }]}
					onRoleChange={vi.fn()}
					pendingFaceId={null}
					getLocalizedPath={(p) => p}
				/>
			</MemoryRouter>
		);

		expect(screen.getByText('pages.adminProfile.activeParticipant')).toBeTruthy();
	});
});
