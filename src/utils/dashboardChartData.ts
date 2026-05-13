import type { StatsTimeseriesResponse } from '../types/adminDashboardStats';

/**
 * Merges two timeseries responses (same bucket granularity and expected overlapping period keys) into rows
 * suitable for a multi-series Recharts dataset. Missing keys default to zero so lines stay aligned.
 */
export function mergeTimeseriesForMultiLineChart(
	seriesA: StatsTimeseriesResponse,
	seriesB: StatsTimeseriesResponse,
	labelA: string,
	labelB: string
): Array<Record<string, string | number>> {
	const keys = new Set<string>();
	for (const b of seriesA.buckets) keys.add(b.periodStartUtc);
	for (const b of seriesB.buckets) keys.add(b.periodStartUtc);
	const sorted = [...keys].sort();

	const mapA = new Map(seriesA.buckets.map((b) => [b.periodStartUtc, b.count]));
	const mapB = new Map(seriesB.buckets.map((b) => [b.periodStartUtc, b.count]));

	return sorted.map((k) => ({
		periodStartUtc: k,
		[labelA]: mapA.get(k) ?? 0,
		[labelB]: mapB.get(k) ?? 0,
	}));
}

/** Shapes content totals for a Recharts pie/donut (name + value). */
export function contentMixPieData(summary: {
	albumsCount: number;
	blogsCount: number;
	reelsCount: number;
	storiesCount: number;
}): Array<{ nameKey: string; value: number }> {
	return [
		{ nameKey: 'albums', value: summary.albumsCount },
		{ nameKey: 'blogs', value: summary.blogsCount },
		{ nameKey: 'reels', value: summary.reelsCount },
		{ nameKey: 'stories', value: summary.storiesCount },
	];
}

/** Friend request outcome breakdown for a bar chart. */
export function friendRequestBarData(summary: {
	friendRequestsCount: number;
	friendRequestsAcceptedCount: number;
	friendRequestsRejectedCount: number;
}): Array<{ nameKey: string; value: number }> {
	return [
		{ nameKey: 'pending', value: summary.friendRequestsCount },
		{ nameKey: 'accepted', value: summary.friendRequestsAcceptedCount },
		{ nameKey: 'rejected', value: summary.friendRequestsRejectedCount },
	];
}
