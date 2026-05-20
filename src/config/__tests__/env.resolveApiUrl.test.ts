import { describe, it, expect } from 'vitest';
import { resolveApiUrl } from '../env';

describe('resolveApiUrl', () => {
	const fallback = 'https://localhost:8001';

	it('uses same origin on admin nginx HTTP port 8090 (LAN)', () => {
		expect(
			resolveApiUrl(fallback, true, {
				port: '8090',
				origin: 'http://172.20.10.14:8090',
				hostname: '172.20.10.14',
				protocol: 'http:',
			})
		).toBe('http://172.20.10.14:8090');
	});

	it('uses same origin on admin nginx HTTPS port 8091', () => {
		expect(
			resolveApiUrl(fallback, true, {
				port: '8091',
				origin: 'https://172.20.10.14:8091',
				hostname: '172.20.10.14',
				protocol: 'https:',
			})
		).toBe('https://172.20.10.14:8091');
	});

	it('falls back to env on production', () => {
		expect(
			resolveApiUrl(fallback, false, {
				port: '8090',
				origin: 'http://x:8090',
				hostname: 'x',
				protocol: 'http:',
			})
		).toBe(fallback);
	});
});
