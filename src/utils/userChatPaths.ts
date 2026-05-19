/** Deep-link query for super-admin user chat (`?u={userId}`). */
export function buildUserChatQuery(userId: string): string {
	return `?u=${encodeURIComponent(userId)}`;
}

/**
 * Localized user-chat path with query (path segment translated; query kept separate).
 * Use instead of `getLocalizedPath(\`/user-chat?u=...\`)` which breaks SK/CZ slugs.
 */
export function buildLocalizedUserChatPath(
	getLocalizedPath: (path: string) => string,
	userId: string
): string {
	return `${getLocalizedPath('user-chat')}${buildUserChatQuery(userId)}`;
}
