import { describe, expect, it } from 'vitest';
import {
	clampLiveStatsCacheMinutes,
	minutesToTtlMilliseconds,
	ttlMillisecondsToMinutes,
} from '../adminAiLiveStatsCacheSettings';

describe('adminAiLiveStatsCacheSettings', () => {
	it('converts minutes to milliseconds', () => {
		expect(minutesToTtlMilliseconds(5)).toBe(300_000);
	});

	it('converts milliseconds to minutes', () => {
		expect(ttlMillisecondsToMinutes(300_000)).toBe(5);
	});

	it('clamps minutes to server bounds', () => {
		expect(clampLiveStatsCacheMinutes(0, 30_000, 3_600_000)).toBe(1);
		expect(clampLiveStatsCacheMinutes(999, 30_000, 3_600_000)).toBe(60);
	});
});
