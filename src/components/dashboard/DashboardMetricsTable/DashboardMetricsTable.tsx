import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Col, Row } from 'react-bootstrap';
import {
	Bar,
	BarChart,
	Cell,
	LabelList,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { translateWallTicketStatus, wallStatusSlices } from './dashboardMetricTiles';
import { buildSectionRows, METRIC_SECTIONS } from './metricSections';
import { MetricSectionChart } from './MetricSectionChart';
import './DashboardMetricsTable.scss';
import type { DashboardMetricsTableProps } from './types';
import { WALL_BAR_COLORS, SECTION_CHIP_COLORS, sectionChartData } from './constants';

/**
 * Platform metrics grouped by domain with one comparison chart per section and compact stat chips.
 */
export function DashboardMetricsTable({ summary }: DashboardMetricsTableProps) {
	const { t } = useTranslation('common');

	const wallSlices = useMemo(() => (summary ? wallStatusSlices(summary) : []), [summary]);

	if (!summary) {
		return <p className="dash-metrics__muted">{t('pages.dashboard.metrics.loading')}</p>;
	}

	return (
		<div className="dash-metrics">
			<header className="dash-metrics__intro">
				<h2 className="dash-metrics__title">{t('pages.dashboard.metrics.sectionTitle')}</h2>
				<p className="dash-metrics__lead">{t('pages.dashboard.metrics.sectionLead')}</p>
			</header>

			{METRIC_SECTIONS.map((section) => {
				const rows = buildSectionRows(summary, section);
				const chartData = sectionChartData(section, rows, t);
				const sectionTotal = rows.reduce((sum, row) => sum + row.value, 0);

				return (
					<section
						key={section.id}
						className="dash-metrics-section"
						style={{ '--section-accent': section.accentColor } as React.CSSProperties}
						aria-labelledby={`dash-section-${section.id}`}
					>
						<div className="dash-metrics-section__head">
							<h3 id={`dash-section-${section.id}`} className="dash-metrics-section__title">
								{t(`pages.dashboard.metrics.${section.titleKey}`)}
							</h3>
							<p className="dash-metrics-section__desc">
								{t(`pages.dashboard.metrics.${section.descriptionKey}`)}
							</p>
							<p className="dash-metrics-section__total">
								{t('pages.dashboard.metrics.sectionTotal', {
									count: sectionTotal.toLocaleString(),
								})}
							</p>
						</div>

						<Row className="g-3 align-items-stretch">
							<Col xs={12} lg={7}>
								<div className="dash-metrics-section__panel dash-metrics-section__panel--chart">
									<MetricSectionChart
										layout={section.chartLayout}
										data={chartData}
										accentColor={section.accentColor}
										emptyLabel={t('pages.dashboard.metrics.chartEmpty')}
									/>
								</div>
							</Col>
							<Col xs={12} lg={5}>
								<ul
									className="dash-metrics-section__chips"
									aria-label={t(`pages.dashboard.metrics.${section.titleKey}`)}
								>
									{rows.map((row, index) => (
										<li
											key={row.field}
											className="dash-metrics-chip"
											style={
												{
													'--chip-accent': SECTION_CHIP_COLORS[index % SECTION_CHIP_COLORS.length],
												} as React.CSSProperties
											}
										>
											<span className="dash-metrics-chip__label">
												{t(`pages.dashboard.metrics.rows.${row.labelKey}`)}
											</span>
											<span className="dash-metrics-chip__value">{row.value.toLocaleString()}</span>
										</li>
									))}
								</ul>
							</Col>
						</Row>
					</section>
				);
			})}

			{wallSlices.length > 0 && (
				<section
					className="dash-metrics-section dash-metrics-section--wall"
					aria-labelledby="dash-section-wall"
				>
					<div className="dash-metrics-section__head">
						<h3 id="dash-section-wall" className="dash-metrics-section__title">
							{t('pages.dashboard.metrics.sections.wall')}
						</h3>
						<p className="dash-metrics-section__desc">
							{t('pages.dashboard.metrics.sections.wallDesc')}
						</p>
					</div>
					<div className="dash-metrics-section__panel dash-metrics-section__panel--chart">
						<p className="dash-metrics-section__wall-total">
							{t('pages.dashboard.metrics.wallTotal', {
								count: wallSlices.reduce((sum, row) => sum + row.count, 0).toLocaleString(),
							})}
						</p>
						<div className="dash-metrics-section__chart dash-metrics-section__chart--wall">
							<ResponsiveContainer width="100%" height={Math.max(180, wallSlices.length * 44)}>
								<BarChart
									data={wallSlices.map((row) => ({
										name: translateWallTicketStatus(row.status, t),
										value: row.count,
									}))}
									layout="vertical"
									margin={{ top: 4, right: 56, left: 4, bottom: 4 }}
								>
									<XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
									<YAxis
										type="category"
										dataKey="name"
										width={88}
										tick={{ fontSize: 11, fill: '#475569' }}
									/>
									<Tooltip formatter={(v: number) => v.toLocaleString()} />
									<Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={16}>
										{wallSlices.map((row, index) => (
											<Cell
												key={row.status}
												fill={WALL_BAR_COLORS[index % WALL_BAR_COLORS.length]}
											/>
										))}
										<LabelList
											dataKey="value"
											position="right"
											fill="#334155"
											fontSize={11}
											fontWeight={600}
										/>
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
				</section>
			)}
		</div>
	);
}
