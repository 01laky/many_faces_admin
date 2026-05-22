/** Operator dashboard message KPI links to `/chat` (platform counts, operator-AI UX). */
export type DashboardPrimaryStatLike = {
	link: string;
};

/** When global AI is off, the messages tile must not look like `/chat` is available. */
export function shouldDashboardPrimaryStatLink(
	operatorAiGloballyEnabled: boolean,
	stat: DashboardPrimaryStatLike
): boolean {
	if (stat.link !== '/chat') return true;
	return operatorAiGloballyEnabled;
}
