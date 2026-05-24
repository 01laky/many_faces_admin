import { describe, it, expect } from 'vitest';
import { buildVanillaPreloaderHtml } from '../globalPreloaderVanillaShell';

describe('bootstrapShell GPL', () => {
	it('GPL-16: vanilla HTML contains logo and dot markup', () => {
		const html = buildVanillaPreloaderHtml();
		expect(html).toContain('width="136"');
		expect(html).toContain('global-app-preloader-vanilla__dot');
	});
});
