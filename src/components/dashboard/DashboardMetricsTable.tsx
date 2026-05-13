import { useTranslation } from 'react-i18next';
import type { AdminDashboardSummary } from '../../types/adminDashboardStats';
import './DashboardMetricsTable.scss';

/** Scalar + count fields rendered in the full metrics table (order is UX grouping, not alphabetical). */
const METRIC_ROWS: Array<{ field: keyof AdminDashboardSummary; labelKey: string }> = [
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

export interface DashboardMetricsTableProps {
	summary: AdminDashboardSummary | undefined;
}

/**
 * Responsive two-column table of every numeric KPI returned by `GET /api/Stats`, plus wall ticket status splits.
 */
export function DashboardMetricsTable({ summary }: DashboardMetricsTableProps) {
	const { t } = useTranslation('common');

	if (!summary) {
		return <p className="dash-metrics__muted">{t('pages.dashboard.metrics.loading')}</p>;
	}

	return (
		<div className="dash-metrics">
			<h2 className="dash-metrics__title">{t('pages.dashboard.metrics.sectionTitle')}</h2>
			<div className="dash-metrics__table-wrap">
				<table className="dash-metrics__table">
					<tbody>
						{METRIC_ROWS.map((row) => (
							<tr key={row.field}>
								<th scope="row">{t(`pages.dashboard.metrics.rows.${row.labelKey}`)}</th>
								<td>{summary[row.field] as number}</td>
							</tr>
						))}
						<tr>
							<th colSpan={2} className="dash-metrics__subhead">
								{t('pages.dashboard.metrics.wallByStatus')}
							</th>
						</tr>
						{Object.entries(summary.faceWallTicketsByStatus)
							.sort(([a], [b]) => a.localeCompare(b))
							.map(([status, count]) => (
								<tr key={status}>
									<th scope="row">{status}</th>
									<td>{count}</td>
								</tr>
							))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
