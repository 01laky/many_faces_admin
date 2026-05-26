import { buildSectionRows, type MetricSectionConfig } from './metricSections';

export const WALL_BAR_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#64748b'];

export const SECTION_CHIP_COLORS = [
	'#3b82f6',
	'#8b5cf6',
	'#10b981',
	'#f59e0b',
	'#ec4899',
	'#0ea5e9',
	'#14b8a6',
];

export function sectionChartData(
	_section: MetricSectionConfig,
	rows: ReturnType<typeof buildSectionRows>,
	t: (key: string) => string
) {
	return rows.map((row, index) => ({
		name: t(`pages.dashboard.metrics.rows.${row.labelKey}`),
		value: row.value,
		fill: SECTION_CHIP_COLORS[index % SECTION_CHIP_COLORS.length]!,
	}));
}
