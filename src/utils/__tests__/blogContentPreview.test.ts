import { describe, expect, it } from 'vitest';
import { resolveBlogBodyPlainText, stripHtmlForOperatorPreview } from '../blogContentPreview';

describe('stripHtmlForOperatorPreview', () => {
	it('strips tags and decodes entities', () => {
		expect(stripHtmlForOperatorPreview('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
	});

	it('prefers API plain text when provided', () => {
		expect(resolveBlogBodyPlainText('From API', '<p>ignored</p>')).toBe('From API');
	});
});
