/**
 * Resolves admin navigation target for a user row: self → profile, others → operator detail.
 */
export function resolveAdminUserDetailPath(
	targetUserId: string,
	currentUserId: string | null | undefined,
	getLocalizedPath: (englishPath: string) => string
): string {
	if (currentUserId && targetUserId === currentUserId) {
		return getLocalizedPath('/profile');
	}
	return getLocalizedPath(`/users/${targetUserId}`);
}
