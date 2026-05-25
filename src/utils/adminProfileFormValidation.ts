/** Identity form guards for Admin profile (SAP-U3). */
export function validateAdminProfileEmail(email: string): 'emailRequired' | 'emailInvalid' | null {
	const trimmed = email.trim();
	if (!trimmed) return 'emailRequired';
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'emailInvalid';
	return null;
}

/** Password confirm guard for Admin profile (SAP-U4). */
export function adminProfilePasswordsMatch(newPassword: string, confirmPassword: string): boolean {
	return newPassword === confirmPassword;
}
