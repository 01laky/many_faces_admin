import type { AdminDashboardSummary } from '@/types/adminDashboardStats';
import type { MetricSectionChartLayout } from './metricSections';
import type { MetricTileChartKind } from './dashboardMetricTiles';

export interface DashboardMetricsTableProps {
	summary: AdminDashboardSummary | undefined;
}

export interface MetricSectionChartDatum {
	name: string;
	value: number;
	fill: string;
}

export interface MetricSectionChartProps {
	layout: MetricSectionChartLayout;
	data: MetricSectionChartDatum[];
	accentColor: string;
	emptyLabel: string;
}

export interface MetricTileChartProps {
	kind: MetricTileChartKind;
	value: number;
	scaleMax: number;
	accentColor: string;
	labelSeed: string;
}
