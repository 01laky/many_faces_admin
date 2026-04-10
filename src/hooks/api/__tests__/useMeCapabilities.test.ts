import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import * as meClient from '../../../api/meCapabilitiesClient';
import {
	createMeCapabilitiesQueryOptions,
	meCapabilitiesKeys,
	meCapabilitiesTokenFingerprint,
} from '../useMeCapabilities';

vi.mock('../../../api/meCapabilitiesClient');

describe('meCapabilitiesTokenFingerprint', () => {
	it('uses short token as-is', () => {
		expect(meCapabilitiesTokenFingerprint('abc')).toBe('abc');
		expect(meCapabilitiesTokenFingerprint(null)).toBe('');
	});

	it('truncates long tokens for stable query keys', () => {
		const long = 'b'.repeat(40);
		expect(meCapabilitiesTokenFingerprint(long)).toBe(`${'b'.repeat(12)}...${'b'.repeat(8)}`);
	});
});

describe('createMeCapabilitiesQueryOptions + React Query', () => {
	beforeEach(() => vi.mocked(meClient.fetchMeCapabilities).mockReset());

	it('fetchQuery runs queryFn when enabled and token set', async () => {
		vi.mocked(meClient.fetchMeCapabilities).mockResolvedValue({
			globalRole: 'ADMIN',
			requestFaceId: 2,
			requestFaceIndex: 'admin',
			isAdminFaceScope: true,
			myFaceRoleName: null,
			permissions: ['platform:admin'],
		});
		const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		const opts = createMeCapabilitiesQueryOptions('my-jwt', true);
		const data = await qc.fetchQuery(opts);
		expect(meClient.fetchMeCapabilities).toHaveBeenCalledWith('my-jwt');
		expect(data?.permissions).toContain('platform:admin');
	});

	it('marks query disabled when enabled flag is false', () => {
		const opts = createMeCapabilitiesQueryOptions('x', false);
		expect(opts.enabled).toBe(false);
	});

	it('marks query disabled when token is missing', () => {
		const opts = createMeCapabilitiesQueryOptions(null, true);
		expect(opts.enabled).toBe(false);
	});
});

describe('meCapabilitiesKeys', () => {
	it('uses a fixed root segment', () => {
		expect(meCapabilitiesKeys.all).toEqual(['meCapabilities']);
	});

	it('session key isolates fingerprints', () => {
		expect(meCapabilitiesKeys.session('a')).not.toEqual(meCapabilitiesKeys.session('b'));
	});
});
