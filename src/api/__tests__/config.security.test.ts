import { describe, expect, it } from 'vitest';
import { assertNoMixedContentApi } from '../config';

describe('configureApiClient mixed content (ASH1-B4)', () => {
	it('blocks https page + http api', () => {
		expect(() => assertNoMixedContentApi('http://localhost:8000', 'https:')).toThrow(
			/Mixed content/
		);
	});

	it('allows https page + https api', () => {
		expect(() => assertNoMixedContentApi('https://localhost:8001', 'https:')).not.toThrow();
	});
});
