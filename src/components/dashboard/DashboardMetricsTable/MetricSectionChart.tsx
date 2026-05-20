import {
	Bar,
	BarChart,
	Cell,
	LabelList,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import type { MetricSectionChartLayout } from './metricSections';

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

const renderBarLabel = (props: {
	x?: number | string;
	y?: number | string;
	width?: number | string;
	height?: number | string;
	value?: number | string;
}) => {
	const { x, y, width, height, value } = props;
	if (value == null || x == null || y == null || width == null || height == null) {
		return null;
	}
	const nx = Number(x);
	const ny = Number(y);
	const nw = Number(width);
	const nh = Number(height);
	const inside = nw > 36;
	return (
		<text
			x={inside ? nx + nw - 6 : nx + nw + 6}
			y={ny + nh / 2}
			fill={inside ? '#fff' : '#334155'}
			fontSize={11}
			fontWeight={600}
			textAnchor={inside ? 'end' : 'start'}
			dominantBaseline="middle"
		>
			{Number(value).toLocaleString()}
		</text>
	);
};

const renderPieLabel = (props: {
	cx?: number;
	cy?: number;
	midAngle?: number;
	innerRadius?: number;
	outerRadius?: number;
	percent?: number;
	value?: number;
}) => {
	const { cx, cy, midAngle, innerRadius, outerRadius, percent, value } = props;
	if (
		cx == null ||
		cy == null ||
		midAngle == null ||
		innerRadius == null ||
		outerRadius == null ||
		percent == null ||
		value == null ||
		percent < 0.04
	) {
		return null;
	}
	const RADIAN = Math.PI / 180;
	const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
	const x = cx + radius * Math.cos(-midAngle * RADIAN);
	const y = cy + radius * Math.sin(-midAngle * RADIAN);
	return (
		<text
			x={x}
			y={y}
			fill="#0f172a"
			textAnchor="middle"
			dominantBaseline="central"
			fontSize={10}
			fontWeight={600}
		>
			{Number(value).toLocaleString()}
		</text>
	);
};

export function MetricSectionChart({
	layout,
	data,
	accentColor,
	emptyLabel,
}: MetricSectionChartProps) {
	const total = data.reduce((sum, row) => sum + row.value, 0);
	if (total === 0) {
		return <p className="dash-metrics-section__chart-empty">{emptyLabel}</p>;
	}

	const height = layout === 'vertical-bar' ? Math.max(160, data.length * 36) : 200;

	return (
		<div className="dash-metrics-section__chart" style={{ minHeight: height }}>
			<ResponsiveContainer width="100%" height={height}>
				{layout === 'donut' ? (
					<PieChart>
						<Pie
							data={data}
							dataKey="value"
							nameKey="name"
							cx="50%"
							cy="50%"
							innerRadius="52%"
							outerRadius="82%"
							paddingAngle={2}
							labelLine={false}
							label={renderPieLabel}
						>
							{data.map((row) => (
								<Cell key={row.name} fill={row.fill} />
							))}
						</Pie>
						<Tooltip formatter={(v: number) => v.toLocaleString()} />
					</PieChart>
				) : layout === 'vertical-bar' ? (
					<BarChart
						data={data}
						layout="vertical"
						margin={{ top: 4, right: 48, left: 4, bottom: 4 }}
					>
						<XAxis type="number" hide domain={[0, 'dataMax']} />
						<YAxis
							type="category"
							dataKey="name"
							width={108}
							tick={{ fontSize: 11, fill: '#475569' }}
						/>
						<Tooltip formatter={(v: number) => v.toLocaleString()} />
						<Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18} fill={accentColor}>
							{data.map((row) => (
								<Cell key={row.name} fill={row.fill} />
							))}
							<LabelList dataKey="value" content={renderBarLabel} position="right" />
						</Bar>
					</BarChart>
				) : (
					<BarChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 48 }}>
						<XAxis
							dataKey="name"
							tick={{ fontSize: 10, fill: '#475569' }}
							interval={0}
							angle={-28}
							textAnchor="end"
							height={56}
						/>
						<YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
						<Tooltip formatter={(v: number) => v.toLocaleString()} />
						<Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
							{data.map((row) => (
								<Cell key={row.name} fill={row.fill} />
							))}
							<LabelList
								dataKey="value"
								position="top"
								fill="#334155"
								fontSize={11}
								fontWeight={600}
							/>
						</Bar>
					</BarChart>
				)}
			</ResponsiveContainer>
		</div>
	);
}
