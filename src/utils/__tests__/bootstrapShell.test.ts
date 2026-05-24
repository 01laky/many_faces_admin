import { describe, it, expect } from 'vitest';
import { buildVanillaPreloaderHtml } from '../globalPreloaderVanillaShell';

describe('bootstrapShell GPL', () => {
	it('GPL-16: vanilla HTML contains logo and dot markup', () => {
		const html = buildVanillaPreloaderHtml();
		expect(html).toContain('Many Faces');
		expect(html).toContain('Sweetest Cat Ever');
		expect(html).toContain('logo-raster-source.png');
		expect(html).toContain('main-logo');
		expect(html).toContain('global-app-preloader-vanilla__dot');
	});
});
