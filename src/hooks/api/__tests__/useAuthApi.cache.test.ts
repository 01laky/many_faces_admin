import { describe, it, expect } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { clearAuthAndCapabilitiesQueries, authKeys } from '../useAuthApi';
import { meCapabilitiesKeys } from '../useMeCapabilities';
import { wallTicketsKeys } from '../useWallTicketsAdminApi';

describe('clearAuthAndCapabilitiesQueries', () => {
	it('removes auth, capabilities, and domain query caches', () => {
		const qc = new QueryClient();
		qc.setQueryData(authKeys.token(), { accessToken: 'x' });
		qc.setQueryData(meCapabilitiesKeys.all, { caps: true });
		qc.setQueryData(wallTicketsKeys.list(1, { page: 1, pageSize: 20, status: '' }), {
			items: [],
		});
		qc.setQueryData(['users', {}], { users: [] });

		clearAuthAndCapabilitiesQueries(qc);

		expect(qc.getQueryData(authKeys.token())).toBeUndefined();
		expect(qc.getQueryData(meCapabilitiesKeys.all)).toBeUndefined();
		expect(
			qc.getQueryData(wallTicketsKeys.list(1, { page: 1, pageSize: 20, status: '' }))
		).toBeUndefined();
		expect(qc.getQueryData(['users', {}])).toBeUndefined();
	});
});
