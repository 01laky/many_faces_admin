export type SearchHealthDto = {
	configured: boolean;
	reachable: boolean;
	clusterName?: string | null;
	message?: string | null;
};
