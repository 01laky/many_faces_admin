import { describe, it, expect, vi } from 'vitest';

vi.mock('../../config/env', () => ({
	env: { apiUrl: 'http://admin-api.test', defaultFacePrefix: 'admin' },
}));

import {
	prependFaceBeforeApi,
	scopePathForCurrentFace,
	absoluteScopedUrl,
	pathAlreadyHasFaceApiPrefix,
} from '../faceApiRouting';

describe('admin faceApiRouting — ACL capabilities path', () => {
	it('prepends admin segment to /api/me/capabilities', () => {
		expect(prependFaceBeforeApi('/api/me/capabilities', 'admin')).toBe('/admin/api/me/capabilities');
	});

	it('scopePathForCurrentFace uses defaultFacePrefix from env', () => {
		expect(scopePathForCurrentFace('/api/me/capabilities')).toBe('/admin/api/me/capabilities');
	});

	it('absoluteScopedUrl combines base URL and scoped path', () => {
		const u = absoluteScopedUrl('/api/me/capabilities');
		expect(u).toBe('http://admin-api.test/admin/api/me/capabilities');
	});

	it('pathAlreadyHasFaceApiPrefix avoids double prefix', () => {
		expect(pathAlreadyHasFaceApiPrefix('/admin/api/me/capabilities')).toBe(true);
		expect(prependFaceBeforeApi('/admin/api/me/capabilities', 'admin')).toBe('/admin/api/me/capabilities');
	});
});
