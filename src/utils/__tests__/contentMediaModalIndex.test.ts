import { describe, it, expect } from 'vitest';
import { getNextIndex, getPrevIndex } from '../contentMediaModalIndex';

describe('contentMediaModalIndex', () => {
	it('wraps next and prev at bounds (ADM-U2)', () => {
		expect(getNextIndex(2, 3)).toBe(0);
		expect(getPrevIndex(0, 3)).toBe(2);
		expect(getNextIndex(0, 1)).toBe(0);
	});
});
