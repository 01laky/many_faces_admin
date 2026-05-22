/** Nav entry shape used by AdminLayout — only `path` is required for filtering. */
export type AdminSidebarNavLike = {
	path: string;
};

/** Hides operator AI Chat (`/chat`) when AI is globally off in backend settings. */
export function filterAdminSidebarNavItemsForAiSystem<T extends AdminSidebarNavLike>(
	items: T[],
	operatorAiGloballyEnabled: boolean
): T[] {
	if (operatorAiGloballyEnabled) return items;
	return items.filter((item) => item.path !== '/chat');
}
