import { describe, it, expect } from 'vitest';
import { isAdminScopeFace } from '../adminScopeFace';

describe('isAdminScopeFace', () => {
	it('returns true for admin index (any case)', () => {
		expect(isAdminScopeFace({ index: 'admin' })).toBe(true);
		expect(isAdminScopeFace({ index: 'Admin' })).toBe(true);
	});

	it('returns false for tenant faces', () => {
		expect(isAdminScopeFace({ index: 'public' })).toBe(false);
		expect(isAdminScopeFace({ index: 'basic' })).toBe(false);
	});

	it('returns false when index missing', () => {
		expect(isAdminScopeFace(null)).toBe(false);
		expect(isAdminScopeFace({})).toBe(false);
	});
});
