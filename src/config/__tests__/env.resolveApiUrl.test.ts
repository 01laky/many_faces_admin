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

	it('falls back to env (VITE_API_URL → :8001) on direct Vite dev server localhost:8082', () => {
		// :8082 is the direct Vite dev server with no /api reverse proxy — same-origin would return
		// index.html and break GET /api/localization/admin, so it must use the configured API base.
		expect(
			resolveApiUrl(fallback, true, {
				port: '8082',
				origin: 'https://localhost:8082',
				hostname: 'localhost',
				protocol: 'https:',
			})
		).toBe(fallback);
	});

	it('derives host:8001 for direct Vite dev server on a remote host (HTTPS :8082)', () => {
		expect(
			resolveApiUrl(fallback, true, {
				port: '8082',
				origin: 'https://172.20.10.14:8082',
				hostname: '172.20.10.14',
				protocol: 'https:',
			})
		).toBe('https://172.20.10.14:8001');
	});

	it('derives host:8000 for direct Vite dev server on a remote host (HTTP :8082)', () => {
		expect(
			resolveApiUrl(fallback, true, {
				port: '8082',
				origin: 'http://172.20.10.14:8082',
				hostname: '172.20.10.14',
				protocol: 'http:',
			})
		).toBe('http://172.20.10.14:8000');
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
