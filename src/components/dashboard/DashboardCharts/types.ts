import type { AdminDashboardSummary } from '@/types/adminDashboardStats';

export interface DashboardChartsProps {
	/** Full summary payload; charts skip rendering heavy sections if null. */
	summary: AdminDashboardSummary | undefined;
	/** Inclusive UTC range start for line chart queries. */
	fromUtc: Date;
	/** Inclusive UTC range end for line chart queries. */
	toUtc: Date;
	/** When false, timeseries queries stay disabled (e.g. parent still loading auth). */
	enabled: boolean;
}
