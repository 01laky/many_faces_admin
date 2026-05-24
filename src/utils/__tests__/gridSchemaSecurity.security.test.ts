import { describe, expect, it } from 'vitest';
import { sanitizeGridSchemaForSave, sanitizeGridTextField } from '../gridSchemaSecurity';

describe('gridSchemaSecurity (ASH1-T-D7-01…D7-02)', () => {
	it('ASH1-T-D7-01: title HTML stripped to plain text length cap', () => {
		const title = '<script>alert(1)</script>Hello';
		expect(sanitizeGridTextField(title)).not.toContain('<script');
		expect(sanitizeGridTextField(title)).toContain('Hello');
	});

	it('ASH1-T-D7-02: boundUrl javascript: cleared', () => {
		const out = sanitizeGridSchemaForSave({
			items: [{ title: 'Tile', boundUrl: 'javascript:alert(1)' }],
		});
		expect(out.items?.[0]?.boundUrl).toBeUndefined();
	});

	it('allows https boundUrl', () => {
		const out = sanitizeGridSchemaForSave({
			items: [{ boundUrl: 'https://cdn.example/page' }],
		});
		expect(out.items?.[0]?.boundUrl).toBe('https://cdn.example/page');
	});
});
