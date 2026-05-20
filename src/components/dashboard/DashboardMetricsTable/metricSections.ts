import type { AdminDashboardSummary } from '@/types/adminDashboardStats';
import { METRIC_TILE_ROWS, readSummaryMetric } from './dashboardMetricTiles';

export type MetricSectionChartLayout = 'horizontal-bar' | 'vertical-bar' | 'donut';

export interface MetricSectionConfig {
	id: string;
	titleKey: string;
	descriptionKey: string;
	accentColor: string;
	/** Subset of summary fields shown as stat chips in this block. */
	fields: Array<keyof AdminDashboardSummary>;
	chartLayout: MetricSectionChartLayout;
}

/** Grouped metrics — avoids one flat grid of 40 identical tiles. */
export const METRIC_SECTIONS: MetricSectionConfig[] = [
	{
		id: 'structure',
		titleKey: 'sections.structure',
		descriptionKey: 'sections.structureDesc',
		accentColor: '#6366f1',
		fields: [
			'pagesCount',
			'pageComponentsCount',
			'pageRouteTranslationsCount',
			'oauthClientsCount',
		],
		chartLayout: 'horizontal-bar',
	},
	{
		id: 'social',
		titleKey: 'sections.social',
		descriptionKey: 'sections.socialDesc',
		accentColor: '#f59e0b',
		fields: [
			'friendRequestsCount',
			'friendRequestsAcceptedCount',
			'friendRequestsRejectedCount',
			'friendshipsCount',
			'userFollowsCount',
			'userBlocksCount',
			'notificationsCount',
		],
		chartLayout: 'vertical-bar',
	},
	{
		id: 'messaging',
		titleKey: 'sections.messaging',
		descriptionKey: 'sections.messagingDesc',
		accentColor: '#10b981',
		fields: ['messagesCount', 'messagesPendingRequestCount'],
		chartLayout: 'horizontal-bar',
	},
	{
		id: 'content',
		titleKey: 'sections.content',
		descriptionKey: 'sections.contentDesc',
		accentColor: '#3b82f6',
		fields: [
			'albumsCount',
			'blogsCount',
			'reelsCount',
			'storiesCount',
			'storyViewsCount',
			'albumCommentsCount',
			'blogCommentsCount',
			'reelCommentsCount',
			'storyCommentsCount',
			'albumLikesCount',
			'blogLikesCount',
			'reelLikesCount',
			'storyLikesCount',
		],
		chartLayout: 'vertical-bar',
	},
	{
		id: 'faceChat',
		titleKey: 'sections.faceChat',
		descriptionKey: 'sections.faceChatDesc',
		accentColor: '#8b5cf6',
		fields: [
			'faceChatRoomsCount',
			'faceChatRoomMembersCount',
			'faceChatRoomMessagesCount',
			'faceChatRoomJoinRequestsPendingCount',
		],
		chartLayout: 'horizontal-bar',
	},
	{
		id: 'profiles',
		titleKey: 'sections.profiles',
		descriptionKey: 'sections.profilesDesc',
		accentColor: '#ec4899',
		fields: [
			'userFaceProfilesCount',
			'userFaceProfileLikesCount',
			'userFaceProfileCommentsCount',
			'userFaceProfileReviewsCount',
		],
		chartLayout: 'donut',
	},
	{
		id: 'trust',
		titleKey: 'sections.trust',
		descriptionKey: 'sections.trustDesc',
		accentColor: '#0ea5e9',
		fields: ['aiReviewJobsCount', 'contentModerationEventsCount'],
		chartLayout: 'horizontal-bar',
	},
];

export interface MetricSectionRow {
	field: keyof AdminDashboardSummary;
	labelKey: string;
	value: number;
}

export function buildSectionRows(
	summary: AdminDashboardSummary,
	section: MetricSectionConfig
): MetricSectionRow[] {
	const labelByField = new Map(METRIC_TILE_ROWS.map((row) => [row.field, row.labelKey] as const));
	return section.fields.map((field) => ({
		field,
		labelKey: labelByField.get(field) ?? String(field),
		value: readSummaryMetric(summary, field),
	}));
}

export function labelKeyForField(field: keyof AdminDashboardSummary): string {
	return METRIC_TILE_ROWS.find((row) => row.field === field)?.labelKey ?? String(field);
}
