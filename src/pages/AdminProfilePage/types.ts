import type { AdminMeProfile } from '@/hooks/api/useAdminMeProfileApi';
import type { AdminMeFaceRow } from '@/api/adminMeProfileApiClient';
import type { FaceRoleOption } from '@/hooks/api/useOperatorUsersApi';

export interface AdminProfileIdentityFormProps {
	profile: AdminMeProfile;
	saving: boolean;
	onSave: (body: {
		email: string;
		firstName: string | null;
		lastName: string | null;
	}) => Promise<void>;
}

export interface AdminProfileFacesTableProps {
	faces: AdminMeFaceRow[];
	faceRoles: FaceRoleOption[];
	onRoleChange: (face: AdminMeFaceRow, userRoleId: number) => void;
	pendingFaceId: number | null;
	getLocalizedPath: (path: string) => string;
}
