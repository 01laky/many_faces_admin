import { describe, expect, it } from 'vitest';
import { mergeStoredAdminUser } from '@/utils/adminProfileStoredUser';

describe('SAP-U7 stored user refresh after identity save', () => {
	const base = {
		id: 'u1',
		email: 'old@test.com',
		firstName: 'Old',
		lastName: 'Name',
	};

	it('merges email and names into stored user snapshot', () => {
		const merged = mergeStoredAdminUser(base, {
			email: 'new@test.com',
			firstName: 'New',
			lastName: 'Person',
		});
		expect(merged).toEqual({
			id: 'u1',
			email: 'new@test.com',
			firstName: 'New',
			lastName: 'Person',
		});
	});

	it('preserves unchanged fields when patch omits them', () => {
		const merged = mergeStoredAdminUser(base, { firstName: 'Updated' });
		expect(merged.email).toBe('old@test.com');
		expect(merged.firstName).toBe('Updated');
		expect(merged.lastName).toBe('Name');
	});
});
