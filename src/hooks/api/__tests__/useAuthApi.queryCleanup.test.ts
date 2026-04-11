/**
 * Ensures admin `clearAuthAndCapabilitiesQueries` wipes the same React Query roots as fe_demo after
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
});
