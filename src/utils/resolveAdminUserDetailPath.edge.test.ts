import { describe, expect, it } from 'vitest';
import { resolveAdminUserDetailPath } from './resolveAdminUserDetailPath';

describe('SAP-U8 resolveAdminUserDetailPath', () => {
	const getLocalizedPath = (path: string) => `/en${path.startsWith('/') ? path : `/${path}`}`;

	it('routes self user id to profile', () => {
		expect(resolveAdminUserDetailPath('u-self', 'u-self', getLocalizedPath)).toBe('/en/profile');
	});

	it('routes other users to operator detail', () => {
		expect(resolveAdminUserDetailPath('other', 'u-self', getLocalizedPath)).toBe('/en/users/other');
	});
});
