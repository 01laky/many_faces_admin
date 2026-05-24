import { describe, expect, it } from 'vitest';
import { isAllowedHttpsUrl, sanitizeHttpsUrl } from '../safeUrl';

describe('safeUrl (ASH1-T-D02…D04)', () => {
	it('ASH1-T-D02: javascript: href rejected', () => {
		expect(isAllowedHttpsUrl('javascript:alert(1)')).toBe(false);
		expect(sanitizeHttpsUrl('javascript:alert(1)')).toBe('');
	});

	it('ASH1-T-D03: data:text/html img src rejected', () => {
		expect(isAllowedHttpsUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
	});

	it('ASH1-T-D04: valid https CDN allowed', () => {
		expect(isAllowedHttpsUrl('https://cdn.example/assets/v.mp4')).toBe(true);
		expect(sanitizeHttpsUrl('https://cdn.example/assets/v.mp4')).toBe(
			'https://cdn.example/assets/v.mp4'
		);
	});

	it('rejects http and localhost', () => {
		expect(isAllowedHttpsUrl('http://cdn.example/x')).toBe(false);
		expect(isAllowedHttpsUrl('https://localhost/x')).toBe(false);
	});
});
