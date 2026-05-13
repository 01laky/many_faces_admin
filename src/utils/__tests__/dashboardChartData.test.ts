import { describe, expect, it } from 'vitest';
import {
	contentMixPieData,
	friendRequestBarData,
	mergeTimeseriesForMultiLineChart,
} from '../dashboardChartData';

describe('mergeTimeseriesForMultiLineChart', () => {
	it('aligns counts on union of period keys', () => {
		const a = {
			metric: 'users',
			bucket: 'day',
			buckets: [
				{ periodStartUtc: '2026-01-01T00:00:00.000Z', count: 2 },
				{ periodStartUtc: '2026-01-02T00:00:00.000Z', count: 1 },
			],
		};
		const b = {
			metric: 'messages',
			bucket: 'day',
			buckets: [{ periodStartUtc: '2026-01-02T00:00:00.000Z', count: 5 }],
		};
		const rows = mergeTimeseriesForMultiLineChart(a, b, 'users', 'messages');
		expect(rows).toEqual([
			{ periodStartUtc: '2026-01-01T00:00:00.000Z', users: 2, messages: 0 },
			{ periodStartUtc: '2026-01-02T00:00:00.000Z', users: 1, messages: 5 },
		]);
	});
});

describe('contentMixPieData', () => {
	it('returns four slices', () => {
		const d = contentMixPieData({ albumsCount: 1, blogsCount: 2, reelsCount: 3, storiesCount: 4 });
		expect(d.reduce((s, x) => s + x.value, 0)).toBe(10);
	});
});

describe('friendRequestBarData', () => {
	it('maps pending to friendRequestsCount field', () => {
		const d = friendRequestBarData({
			friendRequestsCount: 7,
			friendRequestsAcceptedCount: 1,
			friendRequestsRejectedCount: 2,
		});
		expect(d.find((x) => x.nameKey === 'pending')?.value).toBe(7);
	});
});
