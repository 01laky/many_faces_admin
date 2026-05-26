export interface DashboardModerationWidgetProps {
	/** Gate fetches so non-super-admin sessions never hit moderation metrics (would 403). */
	enabled: boolean;
}
