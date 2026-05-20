import type { AdminDashboardSummary } from '@/types/adminDashboardStats';

export type MetricTileChartKind = 'radial' | 'bar' | 'area' | 'donut' | 'horizontal';

export interface MetricTileItem {
	id: string;
	labelKey: string;
	value: number;
	chartKind: MetricTileChartKind;
	accentColor: string;
}

export const METRIC_TILE_ROWS: Array<{ field: keyof AdminDashboardSummary; labelKey: string }> = [
	{ field: 'usersCount', labelKey: 'usersCount' },
	{ field: 'facesCount', labelKey: 'facesCount' },
	{ field: 'pagesCount', labelKey: 'pagesCount' },
	{ field: 'pageComponentsCount', labelKey: 'pageComponentsCount' },
	{ field: 'pageRouteTranslationsCount', labelKey: 'pageRouteTranslationsCount' },
	{ field: 'friendRequestsCount', labelKey: 'friendRequestsPending' },
	{ field: 'friendRequestsAcceptedCount', labelKey: 'friendRequestsAccepted' },
	{ field: 'friendRequestsRejectedCount', labelKey: 'friendRequestsRejected' },
	{ field: 'friendshipsCount', labelKey: 'friendshipsCount' },
	{ field: 'userFollowsCount', labelKey: 'userFollowsCount' },
	{ field: 'userBlocksCount', labelKey: 'userBlocksCount' },
	{ field: 'messagesCount', labelKey: 'messagesCount' },
	{ field: 'messagesPendingRequestCount', labelKey: 'messagesPendingRequestCount' },
	{ field: 'notificationsCount', labelKey: 'notificationsCount' },
	{ field: 'albumsCount', labelKey: 'albumsCount' },
	{ field: 'blogsCount', labelKey: 'blogsCount' },
	{ field: 'reelsCount', labelKey: 'reelsCount' },
	{ field: 'storiesCount', labelKey: 'storiesCount' },
	{ field: 'storyViewsCount', labelKey: 'storyViewsCount' },
	{ field: 'faceChatRoomsCount', labelKey: 'faceChatRoomsCount' },
	{ field: 'faceChatRoomMembersCount', labelKey: 'faceChatRoomMembersCount' },
	{ field: 'faceChatRoomMessagesCount', labelKey: 'faceChatRoomMessagesCount' },
	{
		field: 'faceChatRoomJoinRequestsPendingCount',
		labelKey: 'faceChatRoomJoinRequestsPendingCount',
	},
	{ field: 'faceWallTicketsCount', labelKey: 'faceWallTicketsCount' },
	{ field: 'faceWallTicketCommentsCount', labelKey: 'faceWallTicketCommentsCount' },
	{ field: 'faceWallTicketLikesCount', labelKey: 'faceWallTicketLikesCount' },
	{ field: 'userFaceProfilesCount', labelKey: 'userFaceProfilesCount' },
	{ field: 'userFaceProfileLikesCount', labelKey: 'userFaceProfileLikesCount' },
	{ field: 'userFaceProfileCommentsCount', labelKey: 'userFaceProfileCommentsCount' },
	{ field: 'userFaceProfileReviewsCount', labelKey: 'userFaceProfileReviewsCount' },
	{ field: 'albumCommentsCount', labelKey: 'albumCommentsCount' },
	{ field: 'blogCommentsCount', labelKey: 'blogCommentsCount' },
	{ field: 'reelCommentsCount', labelKey: 'reelCommentsCount' },
	{ field: 'storyCommentsCount', labelKey: 'storyCommentsCount' },
	{ field: 'albumLikesCount', labelKey: 'albumLikesCount' },
	{ field: 'blogLikesCount', labelKey: 'blogLikesCount' },
	{ field: 'reelLikesCount', labelKey: 'reelLikesCount' },
	{ field: 'storyLikesCount', labelKey: 'storyLikesCount' },
	{ field: 'aiReviewJobsCount', labelKey: 'aiReviewJobsCount' },
	{ field: 'contentModerationEventsCount', labelKey: 'contentModerationEventsCount' },
	{ field: 'oauthClientsCount', labelKey: 'oauthClientsCount' },
];

const TILE_ACCENTS = [
	'#3b82f6',
	'#8b5cf6',
	'#6366f1',
	'#f59e0b',
	'#10b981',
	'#0ea5e9',
	'#ec4899',
	'#14b8a6',
];

const CHART_KINDS: MetricTileChartKind[] = ['radial', 'bar', 'area', 'donut', 'horizontal'];

export function pickMetricTileChartKind(index: number): MetricTileChartKind {
	return CHART_KINDS[index % CHART_KINDS.length]!;
}

/** Coerces API scalars; missing or non-finite values become 0 so tiles never crash on partial payloads. */
export function normalizeMetricValue(raw: unknown): number {
	if (typeof raw === 'number' && Number.isFinite(raw)) {
		return raw;
	}
	if (typeof raw === 'string' && raw.trim() !== '') {
		const parsed = Number(raw);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}
	return 0;
}

export function readSummaryMetric(
	summary: AdminDashboardSummary,
	field: keyof AdminDashboardSummary
): number {
	if (field === 'faceWallTicketsByStatus') {
		return 0;
	}
	return normalizeMetricValue(summary[field]);
}

/** Deterministic mini series for area tiles (decorative, derived from the scalar value). */
export function syntheticSparklinePoints(
	value: number,
	seed: string,
	pointCount = 8
): Array<{ idx: number; amount: number }> {
	const base = Math.max(value, 1);
	let hash = 0;
	for (let i = 0; i < seed.length; i += 1) {
		hash = (hash * 31 + seed.charCodeAt(i)) | 0;
	}
	const points: Array<{ idx: number; amount: number }> = [];
	for (let i = 0; i < pointCount; i += 1) {
		const wave = Math.sin((hash + i * 17) * 0.17) * 0.22 + Math.cos((hash + i) * 0.11) * 0.12;
		const scale = 0.55 + ((i + 1) / pointCount) * 0.45;
		points.push({
			idx: i + 1,
			amount: Math.max(0, Math.round(base * scale * (1 + wave))),
		});
	}
	return points;
}

export function buildMetricTiles(summary: AdminDashboardSummary): MetricTileItem[] {
	return METRIC_TILE_ROWS.map((row, index) => ({
		id: row.field,
		labelKey: row.labelKey,
		value: readSummaryMetric(summary, row.field),
		chartKind: pickMetricTileChartKind(index),
		accentColor: TILE_ACCENTS[index % TILE_ACCENTS.length]!,
	}));
}

export function metricScaleMax(values: number[]): number {
	if (values.length === 0) return 1;
	return Math.max(1, ...values);
}

export interface WallStatusTileSlice {
	status: string;
	count: number;
}

export function wallStatusSlices(summary: AdminDashboardSummary): WallStatusTileSlice[] {
	const byStatus = summary.faceWallTicketsByStatus;
	if (!byStatus || typeof byStatus !== 'object') {
		return [];
	}
	return Object.entries(byStatus)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([status, count]) => ({ status, count: normalizeMetricValue(count) }));
}

/** Maps API status enum names to existing face wall ticket labels in AdminResources. */
export function translateWallTicketStatus(status: string, t: (key: string) => string): string {
	const key = `pages.faceWallTickets.status${status}`;
	const label = t(key);
	return label === key ? status : label;
}
