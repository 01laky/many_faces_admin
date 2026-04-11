/**
 * Admin subset of ACL parsing tests — mirrors **fe_demo** `permissions.test.ts` contracts the admin SPA
 * relies on (`parseMeCapabilities`, `hasPermission`, platform role helpers).
 */
import { describe, expect, it } from 'vitest';
import { ACL_PERMISSION_KEYS, ALL_ACL_PERMISSION_KEYS_SORTED } from '../aclPermissionKeys';
import { canPlatformAdmin, hasPermission, parseMeCapabilities } from '../permissions';

/** Same contract as fe_demo: safe parsing of GET /api/me/capabilities JSON (security-hardening prompt). */
describe('parseMeCapabilities', () => {
	it('returns null for invalid payloads', () => {
		expect(parseMeCapabilities(null)).toBeNull();
		expect(
			parseMeCapabilities({
				globalRole: 'X',
				requestFaceId: NaN,
				isAdminFaceScope: true,
				permissions: [],
			})
		).toBeNull();
	});

	it('parses a valid admin-scope payload', () => {
		const caps = parseMeCapabilities({
			globalRole: 'ADMIN',
			requestFaceId: 2,
			requestFaceIndex: 'admin',
			isAdminFaceScope: true,
			myFaceRoleName: null,
			permissions: [ACL_PERMISSION_KEYS.platformAdmin, ACL_PERMISSION_KEYS.tenantSession],
		});
		expect(caps?.isAdminFaceScope).toBe(true);
		expect(canPlatformAdmin(caps)).toBe(true);
	});
});

describe('ACL catalog vs /api/me/capabilities', () => {
	const baseFields = {
		globalRole: 'ADMIN',
		requestFaceId: 2,
		requestFaceIndex: 'admin' as const,
		isAdminFaceScope: true,
		myFaceRoleName: null as string | null,
	};

	it.each(ALL_ACL_PERMISSION_KEYS_SORTED)('accepts permission key %s in payload', (key) => {
		const caps = parseMeCapabilities({
			...baseFields,
			permissions: [key],
		});
		expect(caps).not.toBeNull();
		expect(hasPermission(caps, key)).toBe(true);
	});
});
