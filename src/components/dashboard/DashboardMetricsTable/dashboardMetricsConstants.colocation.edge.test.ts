import { describe, expect, it } from 'vitest';
import { SECTION_CHIP_COLORS, WALL_BAR_COLORS } from './constants';

describe('DashboardMetricsTable colocated constants', () => {
	it('WALL_BAR_COLORS provides six distinct chart colors', () => {
		expect(WALL_BAR_COLORS).toHaveLength(6);
		expect(new Set(WALL_BAR_COLORS).size).toBe(6);
		for (const color of WALL_BAR_COLORS) {
			expect(color).toMatch(/^#[0-9a-f]{6}$/i);
		}
	});

	it('SECTION_CHIP_COLORS cycles safely for section rows', () => {
		expect(SECTION_CHIP_COLORS.length).toBeGreaterThan(0);
		const tenth = SECTION_CHIP_COLORS[9 % SECTION_CHIP_COLORS.length];
		expect(tenth).toMatch(/^#[0-9a-f]{6}$/i);
	});

	it('chip palette is longer than wall palette for multi-section dashboards', () => {
		expect(SECTION_CHIP_COLORS.length).toBeGreaterThan(WALL_BAR_COLORS.length);
	});
});
