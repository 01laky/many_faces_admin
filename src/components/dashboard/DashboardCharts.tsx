import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { useStatsTimeseries } from '../../hooks/api/useStatsApi';
import type { AdminDashboardSummary } from '../../types/adminDashboardStats';
import {
	contentMixPieData,
	friendRequestBarData,
	mergeTimeseriesForMultiLineChart,
} from '../../utils/dashboardChartData';
import './DashboardCharts.scss';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];
const BAR_COLORS = ['#f59e0b', '#22c55e', '#ef4444'];

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

/**
 * Dashboard chart bundle: registrations vs messages (line), content mix (donut), friend-request outcomes (bar).
 * Fetches two parallel timeseries via TanStack Query; parent supplies the sliding date window.
 */
export function DashboardCharts({ summary, fromUtc, toUtc, enabled }: DashboardChartsProps) {
	const { t } = useTranslation('common');

	const usersTs = useStatsTimeseries({ metric: 'users', fromUtc, toUtc, bucket: 'day' }, enabled);
	const messagesTs = useStatsTimeseries(
		{ metric: 'messages', fromUtc, toUtc, bucket: 'day' },
		enabled
	);

	const lineData = useMemo(() => {
		if (!usersTs.data || !messagesTs.data) return [];
		return mergeTimeseriesForMultiLineChart(
			usersTs.data,
			messagesTs.data,
			'newUsers',
			'messages'
		).map((row) => ({
			...row,
			/** Short label for category axis (UTC date portion). */
			day: String(row.periodStartUtc).slice(0, 10),
		}));
	}, [usersTs.data, messagesTs.data]);

	const pieData = useMemo(() => {
		if (!summary) return [];
		return contentMixPieData(summary).map((row) => ({
			name: t(`pages.dashboard.charts.contentSlices.${row.nameKey}`),
			value: row.value,
		}));
	}, [summary, t]);

	const barData = useMemo(() => {
		if (!summary) return [];
		return friendRequestBarData(summary).map((row) => ({
			name: t(`pages.dashboard.charts.friendRequests.${row.nameKey}`),
			value: row.value,
		}));
	}, [summary, t]);

	const lineBusy = usersTs.isLoading || messagesTs.isLoading;
	const lineError = usersTs.isError || messagesTs.isError;

	return (
		<div className="dashboard-charts">
			<h2 className="dashboard-charts__title">{t('pages.dashboard.charts.sectionTitle')}</h2>

			<div className="dashboard-charts__grid">
				<section className="dashboard-charts__panel" aria-labelledby="dash-chart-line-title">
					<h3 id="dash-chart-line-title" className="dashboard-charts__panel-title">
						{t('pages.dashboard.charts.lineTitle')}
					</h3>
					{lineError ? (
						<p className="dashboard-charts__muted" role="alert">
							{t('pages.dashboard.charts.loadError')}
						</p>
					) : lineBusy ? (
						<p className="dashboard-charts__muted">{t('pages.dashboard.charts.loading')}</p>
					) : lineData.length === 0 ? (
						<p className="dashboard-charts__muted">{t('pages.dashboard.charts.empty')}</p>
					) : (
						<div
							className="dashboard-charts__chart-wrap"
							role="img"
							aria-label={t('pages.dashboard.charts.lineAria')}
						>
							<ResponsiveContainer width="100%" height={280}>
								<LineChart data={lineData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
									<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
									<XAxis dataKey="day" tick={{ fontSize: 11 }} />
									<YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
									<Tooltip />
									<Legend />
									<Line
										type="monotone"
										dataKey="newUsers"
										name={t('pages.dashboard.charts.seriesNewUsers')}
										stroke="#3b82f6"
										strokeWidth={2}
										dot={false}
									/>
									<Line
										type="monotone"
										dataKey="messages"
										name={t('pages.dashboard.charts.seriesMessages')}
										stroke="#10b981"
										strokeWidth={2}
										dot={false}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					)}
				</section>

				<section className="dashboard-charts__panel" aria-labelledby="dash-chart-pie-title">
					<h3 id="dash-chart-pie-title" className="dashboard-charts__panel-title">
						{t('pages.dashboard.charts.pieTitle')}
					</h3>
					{!summary ? (
						<p className="dashboard-charts__muted">{t('pages.dashboard.charts.loading')}</p>
					) : pieData.every((d) => d.value === 0) ? (
						<p className="dashboard-charts__muted">{t('pages.dashboard.charts.empty')}</p>
					) : (
						<div
							className="dashboard-charts__chart-wrap"
							role="img"
							aria-label={t('pages.dashboard.charts.pieAria')}
						>
							<ResponsiveContainer width="100%" height={280}>
								<PieChart>
									<Pie
										data={pieData}
										dataKey="value"
										nameKey="name"
										cx="50%"
										cy="50%"
										outerRadius={90}
										label
									>
										{pieData.map((_, i) => (
											<Cell key={pieData[i].name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
										))}
									</Pie>
									<Tooltip />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>
					)}
				</section>

				<section className="dashboard-charts__panel" aria-labelledby="dash-chart-bar-title">
					<h3 id="dash-chart-bar-title" className="dashboard-charts__panel-title">
						{t('pages.dashboard.charts.barTitle')}
					</h3>
					{!summary ? (
						<p className="dashboard-charts__muted">{t('pages.dashboard.charts.loading')}</p>
					) : barData.every((d) => d.value === 0) ? (
						<p className="dashboard-charts__muted">{t('pages.dashboard.charts.empty')}</p>
					) : (
						<div
							className="dashboard-charts__chart-wrap"
							role="img"
							aria-label={t('pages.dashboard.charts.barAria')}
						>
							<ResponsiveContainer width="100%" height={280}>
								<BarChart data={barData} margin={{ top: 8, right: 16, left: 0, bottom: 32 }}>
									<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
									<XAxis dataKey="name" tick={{ fontSize: 11 }} />
									<YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
									<Tooltip />
									<Bar dataKey="value" name={t('pages.dashboard.charts.barValue')}>
										{barData.map((_, i) => (
											<Cell key={barData[i].name} fill={BAR_COLORS[i % BAR_COLORS.length]} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
