import { describe, expect, it } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { authKeys, clearAuthAndCapabilitiesQueries } from '../useAuthApi';

describe('logout cache hygiene (ASH1-T-A11)', () => {
	it('clearAuthAndCapabilitiesQueries removes auth root', () => {
		const qc = new QueryClient();
		qc.setQueryData(authKeys.token(), { accessToken: 'x' });
		clearAuthAndCapabilitiesQueries(qc);
		expect(qc.getQueryData(authKeys.token())).toBeUndefined();
	});
});
