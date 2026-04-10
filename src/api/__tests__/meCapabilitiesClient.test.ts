import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/env', () => ({
	env: { apiUrl: 'http://api.test', defaultFacePrefix: 'admin' },
}));

vi.mock('axios', () => ({
	default: { get: vi.fn() },
}));

import axios from 'axios';
import { fetchMeCapabilities } from '../meCapabilitiesClient';

describe('fetchMeCapabilities', () => {
	beforeEach(() => {
		vi.mocked(axios.get).mockReset();
	});

	it('GETs /api/me/capabilities with Bearer token', async () => {
		vi.mocked(axios.get).mockResolvedValue({
			data: {
				globalRole: 'ADMIN',
				requestFaceId: 2,
				requestFaceIndex: 'admin',
				isAdminFaceScope: true,
				myFaceRoleName: null,
				permissions: ['platform:admin'],
			},
		});
		const result = await fetchMeCapabilities('secret-token');
		expect(axios.get).toHaveBeenCalledWith('http://api.test/api/me/capabilities', {
			headers: { Authorization: 'Bearer secret-token' },
		});
		expect(result?.permissions).toContain('platform:admin');
	});

	it('returns null when JSON fails parseMeCapabilities', async () => {
		vi.mocked(axios.get).mockResolvedValue({ data: { globalRole: 1 } });
		await expect(fetchMeCapabilities('t')).resolves.toBeNull();
	});

	it('propagates axios errors', async () => {
		vi.mocked(axios.get).mockRejectedValue(new Error('network'));
		await expect(fetchMeCapabilities('t')).rejects.toThrow('network');
	});
});
