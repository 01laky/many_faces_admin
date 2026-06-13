/**
 * Ensures admin `clearAuthAndCapabilitiesQueries` wipes the same React Query roots as many_faces_portal after
 * refresh failure or logout (prevents stale capability-driven navigation).
 */
import { describe, it, expect } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { clearAuthAndCapabilitiesQueries, authKeys } from '../useAuthApi';
import { meCapabilitiesKeys } from '../useMeCapabilities';

describe('clearAuthAndCapabilitiesQueries', () => {
	it('removes auth and meCapabilities queries after refresh failure', () => {
		const qc = new QueryClient();
		qc.setQueryData(authKeys.user(), { id: '1' });
		qc.setQueryData(meCapabilitiesKeys.session('fp'), { permissions: [] });

		clearAuthAndCapabilitiesQueries(qc);

		expect(qc.getQueryData(authKeys.user())).toBeUndefined();
		expect(qc.getQueryData(meCapabilitiesKeys.session('fp'))).toBeUndefined();
	});

	it('wipes per-face operator content caches on logout (REQ-SECURITY-CACHE, no tenant leak)', () => {
		// Regression: these roots were registered by their hooks but missing from DOMAIN_QUERY_ROOTS,
		// so a previous operator's tenant data survived logout into the next session's cache.
		const faceScopedRoots = [
			'faceProfiles',
			'faceChatRooms',
			'faceVideoLounges',
			'stories',
			'reels',
			'blogs',
			'albums',
		];
		const qc = new QueryClient();
		for (const root of faceScopedRoots) {
			qc.setQueryData([root, 1, 'list'], [{ id: 1 }]);
		}

		clearAuthAndCapabilitiesQueries(qc);

		for (const root of faceScopedRoots) {
			expect(qc.getQueryData([root, 1, 'list'])).toBeUndefined();
		}
	});
});
