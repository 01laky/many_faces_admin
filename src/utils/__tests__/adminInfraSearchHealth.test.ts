import { describe, expect, it } from 'vitest';
import { resolveSearchHealthUiState } from '../adminInfraSearchHealth';

describe('resolveSearchHealthUiState', () => {
	it('returns disabled when not configured', () => {
		expect(resolveSearchHealthUiState({ configured: false, reachable: false })).toBe('disabled');
	});

	it('returns unreachable when configured but not reachable', () => {
		expect(resolveSearchHealthUiState({ configured: true, reachable: false })).toBe('unreachable');
	});

	it('returns healthy when configured and reachable', () => {
		expect(resolveSearchHealthUiState({ configured: true, reachable: true })).toBe('healthy');
	});
});
