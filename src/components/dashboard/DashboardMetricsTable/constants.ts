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

/** Value union recharts hands to a `<Tooltip formatter>` (`ValueType | undefined`). */
export type ChartTooltipValue = number | string | ReadonlyArray<number | string> | undefined;

/**
 * Formats a recharts tooltip value as a localized number.
 *
 * Recharts types the incoming value as `ValueType | undefined`, not `number`, so the callers here
 * cannot declare `(v: number) => …` — that claims recharts will never pass a string, an array or
 * undefined, which its own types explicitly allow. Every chart in this folder feeds a numeric
 * `value` field, so the number branch is the live path; the rest are rendered verbatim instead of
 * crashing on `.toLocaleString()` if a dataset ever changes shape.
 */
export function formatChartTooltipValue(value: ChartTooltipValue): string {
	if (value == null) return '';
	if (typeof value === 'number') return value.toLocaleString();
	if (typeof value === 'string') return value;
	return value
		.map((entry) => (typeof entry === 'number' ? entry.toLocaleString() : entry))
		.join(', ');
}
