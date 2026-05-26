import type { AdminMeProfile } from '@/hooks/api/useAdminMeProfileApi';

export interface AdminProfileIdentityFormProps {
	profile: AdminMeProfile;
	saving: boolean;
	onSave: (body: {
		email: string;
		firstName: string | null;
		lastName: string | null;
	}) => Promise<void>;
}
