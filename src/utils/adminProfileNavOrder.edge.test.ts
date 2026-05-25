import { describe, expect, it } from 'vitest';

/** Mirrors super-admin sidebar tail from AdminLayout NAV_ITEMS (SAP-U5). */
const SUPER_ADMIN_NAV_PATHS = [
	'/dashboard',
	'/users',
	'/faces',
	'/chat',
	'/moderation',
	'/user-chat',
	'/profile',
	'/settings',
] as const;

export function isAdminProfileBeforeSettings(paths: readonly string[]): boolean {
	const profileIdx = paths.indexOf('/profile');
	const settingsIdx = paths.indexOf('/settings');
	return profileIdx >= 0 && settingsIdx === profileIdx + 1;
}

describe('SAP-U5 admin profile nav order', () => {
	it('places profile immediately before settings', () => {
		expect(isAdminProfileBeforeSettings(SUPER_ADMIN_NAV_PATHS)).toBe(true);
	});
});
