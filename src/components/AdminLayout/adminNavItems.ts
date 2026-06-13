import type { NavItem } from './types';

/**
 * Sidebar nav-item definitions and the base ordering, extracted from AdminLayout so the order
 * (SAP-U5: admin profile immediately before settings) can be unit-tested without mounting the layout.
 */

export const NAV_ITEMS: NavItem[] = [
	{ path: '/dashboard', labelKey: 'pages.dashboard.title', icon: '📊' },
	{ path: '/users', labelKey: 'pages.users.title', icon: '👥' },
	{ path: '/faces', labelKey: 'pages.faces.title', icon: '😀' },
	{ path: '/chat', labelKey: 'pages.chat.title', icon: '💬' },
];

export const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
	{ path: '/moderation', labelKey: 'pages.moderation.title', icon: '🛡' },
	{ path: '/user-chat', labelKey: 'pages.userChat.title', icon: '📩' },
];

export const SETTINGS_NAV_ITEM: NavItem = {
	path: '/settings',
	labelKey: 'pages.settings.title',
	icon: '⚙️',
};

export const ADMIN_PROFILE_NAV_ITEM: NavItem = {
	path: '/profile',
	labelKey: 'pages.adminProfile.title',
	icon: '👤',
};

/**
 * Base sidebar nav order (before AI-feature gating). The admin profile entry must sit immediately
 * before settings for both roles (SAP-U5).
 */
export function buildBaseAdminNavItems(isSuperAdmin: boolean): NavItem[] {
	return isSuperAdmin
		? [...NAV_ITEMS, ...SUPER_ADMIN_NAV_ITEMS, ADMIN_PROFILE_NAV_ITEM, SETTINGS_NAV_ITEM]
		: [...NAV_ITEMS, ADMIN_PROFILE_NAV_ITEM, SETTINGS_NAV_ITEM];
}
