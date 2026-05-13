import { useQuery } from '@tanstack/react-query';
import { OpenAPI } from '../../api/core/OpenAPI';
import { request as __request } from '../../api/core/request';
import type {
	AdminDashboardSummary,
	StatsTimeseriesMetric,
	StatsTimeseriesResponse,
} from '../../types/adminDashboardStats';

/**
 * Fetches the consolidated operator dashboard payload. Requires admin-face scoped requests plus a JWT
 * that satisfies backend `CanManageAllFaces` (see `many_faces_backend` `StatsController`).
 */
export async function fetchAdminDashboardSummary(): Promise<AdminDashboardSummary> {
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: '/api/Stats',
	});
	return response as AdminDashboardSummary;
}

/**
 * Histogram buckets for dashboard charts. Range and metric are forwarded as ISO UTC query parameters.
 */
export async function fetchStatsTimeseries(params: {
	metric: StatsTimeseriesMetric;
	fromUtc: Date;
	toUtc: Date;
	bucket?: 'day' | 'week';
}): Promise<StatsTimeseriesResponse> {
	const { metric, fromUtc, toUtc, bucket = 'day' } = params;
	const q = new URLSearchParams({
		metric,
		fromUtc: fromUtc.toISOString(),
		toUtc: toUtc.toISOString(),
		bucket,
	});
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/Stats/timeseries?${q.toString()}`,
	});
	return response as StatsTimeseriesResponse;
}

/**
 * React Query hook for the consolidated dashboard summary. Disabled when `enabled` is false (e.g. no token yet).
 */
export function useStats(enabled = true) {
	return useQuery({
		queryKey: ['stats', 'dashboard-summary'],
		queryFn: fetchAdminDashboardSummary,
		enabled,
		staleTime: 60_000,
	});
}

export function useStatsTimeseries(
	params: {
		metric: StatsTimeseriesMetric;
		fromUtc: Date;
		toUtc: Date;
		bucket?: 'day' | 'week';
	},
	enabled = true
) {
	const { metric, fromUtc, toUtc, bucket = 'day' } = params;
	return useQuery({
		queryKey: ['stats', 'timeseries', metric, fromUtc.toISOString(), toUtc.toISOString(), bucket],
		queryFn: () => fetchStatsTimeseries({ metric, fromUtc, toUtc, bucket }),
		enabled,
		staleTime: 60_000,
	});
}
