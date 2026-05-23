import { describe, expect, it } from 'vitest';
import { formatDate, formatValue, mutationErrorMessage } from '../operatorDetailFormat';

describe('operatorDetailFormat (REF-F1…F8)', () => {
	it('REF-F1: formatValue maps empty to em dash', () => {
		expect(formatValue(null)).toBe('—');
		expect(formatValue(undefined)).toBe('—');
		expect(formatValue('')).toBe('—');
	});

	it('REF-F2: formatValue preserves zero', () => {
		expect(formatValue(0)).toBe('0');
	});

	it('REF-F3: formatDate rejects invalid ISO', () => {
		expect(formatDate('not-a-date')).toBe('—');
		expect(formatDate(null)).toBe('—');
	});

	it('REF-F4: formatDate formats valid ISO', () => {
		const out = formatDate('2026-01-15T12:00:00.000Z');
		expect(out).not.toBe('—');
		expect(out.length).toBeGreaterThan(4);
	});

	it('REF-F5: mutationErrorMessage uses Error.message', () => {
		expect(mutationErrorMessage(new Error('boom'))).toBe('boom');
	});

	it('REF-F6: mutationErrorMessage uses non-empty string', () => {
		expect(mutationErrorMessage('  network  ')).toBe('network');
	});

	it('REF-F7: mutationErrorMessage default for empty Error', () => {
		expect(mutationErrorMessage(new Error(''))).toBe('Request failed');
	});

	it('REF-F8: mutationErrorMessage default for unknown objects', () => {
		expect(mutationErrorMessage({ code: 500 })).toBe('Request failed');
	});
});
