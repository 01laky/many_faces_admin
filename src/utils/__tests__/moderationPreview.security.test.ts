import { describe, expect, it } from 'vitest';
import {
	escapeHtmlForTextNode,
	formatModerationBodyPreview,
	formatModerationMediaPreview,
} from '../moderationPreview';

describe('moderationPreview security (ASH1-T-D01…D06)', () => {
	it('ASH1-T-D01: script tag neutralized', () => {
		expect(escapeHtmlForTextNode('<script>alert(1)</script>')).not.toContain('<script');
	});

	it('ASH1-T-D02: javascript media rejected', () => {
		expect(formatModerationMediaPreview('javascript:alert(1)')).toBeNull();
	});

	it('ASH1-T-D04: https media allowed', () => {
		expect(formatModerationMediaPreview('https://cdn.test/v.mp4')).toBe('https://cdn.test/v.mp4');
	});

	it('ASH1-T-D05: bidi override remains plain text in body preview', () => {
		const bidi = '\u202Eevil';
		const preview = formatModerationBodyPreview(bidi);
		expect(preview).toBe(bidi);
		expect(preview).not.toContain('<');
	});

	it('ASH1-T-D06: null byte in body stays text-only path', () => {
		const withNull = 'hello\u0000world';
		expect(formatModerationBodyPreview(withNull)).toBe(withNull);
	});
});
