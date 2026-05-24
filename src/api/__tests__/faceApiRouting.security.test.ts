import { describe, expect, it } from 'vitest';
import {
	applyFacePrefixToRequestUrl,
	isApiPathExemptFromFacePrefix,
	pathAlreadyHasFaceApiPrefix,
	prependFaceBeforeApi,
	prependFaceBeforeHubs,
} from '../faceApiRouting';

const BASE = 'https://localhost:8001';
const FACE = 'admin';

describe('faceApiRouting (ASH1-T-B01…B05)', () => {
	it('ASH1-T-B01: /api/users → /admin/api/users', () => {
		expect(prependFaceBeforeApi('/api/users', FACE)).toBe('/admin/api/users');
	});

	it('ASH1-T-B02: /api/oauth2/token not prefixed', () => {
		expect(isApiPathExemptFromFacePrefix('/api/oauth2/token')).toBe(true);
		expect(prependFaceBeforeApi('/api/oauth2/token', FACE)).toBe('/api/oauth2/token');
	});

	it('ASH1-T-B03: /hubs/chat → /admin/hubs/chat', () => {
		expect(prependFaceBeforeHubs('/hubs/chat', FACE)).toBe('/admin/hubs/chat');
	});

	it('ASH1-T-B04: already /admin/api/... not double-prefixed', () => {
		expect(pathAlreadyHasFaceApiPrefix('/admin/api/users')).toBe(true);
		expect(prependFaceBeforeApi('/admin/api/users', FACE)).toBe('/admin/api/users');
	});

	it('ASH1-T-B05: query string preserved', () => {
		expect(prependFaceBeforeApi('/api/pages?faceId=1', FACE)).toBe('/admin/api/pages?faceId=1');
	});

	it('applyFacePrefixToRequestUrl with absolute base URL', () => {
		expect(applyFacePrefixToRequestUrl('/api/users', FACE, BASE)).toBe('/admin/api/users');
		expect(applyFacePrefixToRequestUrl(`${BASE}/api/users`, FACE, BASE)).toBe(
			`${BASE}/admin/api/users`
		);
	});
});
