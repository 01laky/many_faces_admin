import { describe, it, expect } from 'vitest';
import { getQueryErrorMessage } from '../queryErrorMessage';

describe('getQueryErrorMessage', () => {
	it('returns Error message', () => {
		expect(getQueryErrorMessage(new Error('boom'), 'fallback')).toBe('boom');
	});

	it('returns fallback for unknown', () => {
		expect(getQueryErrorMessage(null, 'fallback')).toBe('fallback');
	});
});
