import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	Cell,
	Pie,
	PieChart,
	RadialBar,
	RadialBarChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts';
import { syntheticSparklinePoints } from './dashboardMetricTiles';
import type { MetricTileChartProps } from './types';

const CHART_HEIGHT = 72;

export function MetricTileChart({
	kind,
	value,
	scaleMax,
	accentColor,
	labelSeed,
}: MetricTileChartProps) {
	const pct = Math.min(100, Math.round((value / scaleMax) * 100));
	const sparkline = syntheticSparklinePoints(value, labelSeed);

	if (kind === 'horizontal') {
		return (
			<div className="dash-metric-tile__progress" aria-hidden>
				<div
					className="dash-metric-tile__progress-fill"
					style={{ width: `${pct}%`, backgroundColor: accentColor }}
				/>
			</div>
		);
	}

	return (
		<div className="dash-metric-tile__chart" aria-hidden>
			<ResponsiveContainer width="100%" height={CHART_HEIGHT}>
				{kind === 'radial' ? (
					<RadialBarChart
						cx="50%"
						cy="100%"
						innerRadius="28%"
						outerRadius="100%"
						barSize={10}
						data={[{ name: 'v', fill: accentColor, value: pct }]}
						startAngle={180}
						endAngle={0}
					>
						<RadialBar dataKey="value" cornerRadius={4} background={{ fill: '#e2e8f0' }} />
					</RadialBarChart>
				) : kind === 'bar' ? (
					<BarChart data={[{ name: 'v', value }]} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
						<XAxis dataKey="name" hide />
						<YAxis hide domain={[0, scaleMax]} />
						<Bar dataKey="value" fill={accentColor} radius={[6, 6, 0, 0]} maxBarSize={48} />
					</BarChart>
				) : kind === 'area' ? (
					<AreaChart data={sparkline} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
						<defs>
							<linearGradient id={`tile-grad-${labelSeed}`} x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={accentColor} stopOpacity={0.45} />
								<stop offset="100%" stopColor={accentColor} stopOpacity={0.05} />
							</linearGradient>
						</defs>
						<XAxis dataKey="idx" hide />
						<YAxis hide domain={[0, 'dataMax']} />
						<Area
							type="monotone"
							dataKey="amount"
							stroke={accentColor}
							fill={`url(#tile-grad-${labelSeed})`}
							strokeWidth={2}
							dot={false}
							isAnimationActive={false}
						/>
					</AreaChart>
				) : (
					<PieChart>
						<Pie
							data={[
								{ name: 'value', value },
								{ name: 'rest', value: Math.max(0, scaleMax - value) },
							]}
							dataKey="value"
							cx="50%"
							cy="50%"
							innerRadius="58%"
							outerRadius="88%"
							startAngle={90}
							endAngle={-270}
							stroke="none"
							isAnimationActive={false}
						>
							<Cell fill={accentColor} />
							<Cell fill="#e2e8f0" />
						</Pie>
					</PieChart>
				)}
			</ResponsiveContainer>
		</div>
	);
}
