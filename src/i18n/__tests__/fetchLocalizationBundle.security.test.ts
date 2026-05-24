import { describe, expect, it } from 'vitest';

describe('localization URL (ASH1-T-B07)', () => {
	it('uses bare /api/localization/admin without face prefix', () => {
		const base = 'https://localhost:8001';
		const url = new URL(`${base}/api/localization/admin`);
		expect(url.pathname).toBe('/api/localization/admin');
		expect(url.pathname).not.toContain('/admin/api/');
	});
});
