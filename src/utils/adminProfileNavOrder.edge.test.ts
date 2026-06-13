import { describe, expect, it } from 'vitest';
import { buildBaseAdminNavItems } from '@/components/AdminLayout/adminNavItems';

/**
 * SAP-U5: the admin profile entry must sit immediately before settings in the real sidebar order.
 * This asserts against the actual AdminLayout nav builder (not a hand-mirrored copy), so a future
 * reorder of AdminLayout's nav items is caught here.
 */
function navPaths(isSuperAdmin: boolean): string[] {
	return buildBaseAdminNavItems(isSuperAdmin).map((item) => item.path);
}

function profileImmediatelyBeforeSettings(paths: string[]): boolean {
	const profileIdx = paths.indexOf('/profile');
	const settingsIdx = paths.indexOf('/settings');
	return profileIdx >= 0 && settingsIdx === profileIdx + 1;
}

describe('SAP-U5 admin profile nav order', () => {
	it('places profile immediately before settings for a super-admin', () => {
		expect(profileImmediatelyBeforeSettings(navPaths(true))).toBe(true);
	});

	it('places profile immediately before settings for a non-super-admin', () => {
		expect(profileImmediatelyBeforeSettings(navPaths(false))).toBe(true);
	});

	it('keeps settings as the final entry', () => {
		expect(navPaths(true).at(-1)).toBe('/settings');
		expect(navPaths(false).at(-1)).toBe('/settings');
	});
});
