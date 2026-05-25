import { describe, expect, it } from 'vitest';
import {
	validateAdminProfileEmail,
	adminProfilePasswordsMatch,
} from '@/utils/adminProfileFormValidation';

describe('SAP-U3 identity form validation', () => {
	it('requires email', () => {
		expect(validateAdminProfileEmail('')).toBe('emailRequired');
		expect(validateAdminProfileEmail('   ')).toBe('emailRequired');
	});

	it('rejects invalid email format', () => {
		expect(validateAdminProfileEmail('not-an-email')).toBe('emailInvalid');
	});

	it('accepts valid email', () => {
		expect(validateAdminProfileEmail('admin@admin.com')).toBeNull();
	});
});

describe('SAP-U4 password confirm mismatch', () => {
	it('blocks submit when passwords differ', () => {
		expect(adminProfilePasswordsMatch('Secret1!', 'Secret2!')).toBe(false);
	});

	it('allows submit when passwords match', () => {
		expect(adminProfilePasswordsMatch('Secret1!', 'Secret1!')).toBe(true);
	});
});
