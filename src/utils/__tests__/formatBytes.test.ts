import { describe, it, expect } from 'vitest';
import { formatBytes } from '../formatBytes';

/**
 * Edge-case coverage for the 1024-based byte formatter (previously untested): nullish/non-finite input,
 * unit promotion at the 1024 boundary, the "one decimal below 10, none at/above 10" rule, and the TB cap.
 */

describe('formatBytes', () => {
	it('returns an em dash for nullish or non-finite input', () => {
		expect(formatBytes(undefined)).toBe('—');
		expect(formatBytes(Number.NaN)).toBe('—');
		expect(formatBytes(Number.POSITIVE_INFINITY)).toBe('—');
	});

	it('formats sub-kilobyte values as whole bytes', () => {
		expect(formatBytes(0)).toBe('0 B');
		expect(formatBytes(512)).toBe('512 B');
		expect(formatBytes(1023)).toBe('1023 B');
	});

	it('promotes to KB at 1024 and keeps one decimal below 10', () => {
		expect(formatBytes(1024)).toBe('1.0 KB');
		expect(formatBytes(1536)).toBe('1.5 KB');
	});

	it('drops decimals once the scaled size reaches 10', () => {
		expect(formatBytes(10 * 1024)).toBe('10 KB');
	});

	it('scales through MB, GB and TB', () => {
		expect(formatBytes(1024 ** 2)).toBe('1.0 MB');
		expect(formatBytes(1024 ** 3)).toBe('1.0 GB');
		expect(formatBytes(1024 ** 4)).toBe('1.0 TB');
	});

	it('caps the unit at TB for very large values', () => {
		expect(formatBytes(5 * 1024 ** 4)).toBe('5.0 TB');
		expect(formatBytes(50 * 1024 ** 4)).toBe('50 TB');
	});
});
