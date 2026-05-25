export interface StoredAdminUser {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
}

/** Merge identity fields into stored auth user after profile save (SAP-U7). */
export function mergeStoredAdminUser(
	user: StoredAdminUser,
	patch: { email?: string; firstName?: string; lastName?: string }
): StoredAdminUser {
	return {
		...user,
		email: patch.email ?? user.email,
		firstName: patch.firstName ?? user.firstName,
		lastName: patch.lastName ?? user.lastName,
	};
}
