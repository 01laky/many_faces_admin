import { useQuery } from '@tanstack/react-query';
import type { PublicStatsSnapshot } from '../../../types/publicStatsSnapshot';
import { absolutePublicFaceUrl } from '../../../api/faceApiRouting';

export async function fetchPublicStatsSnapshot(): Promise<PublicStatsSnapshot> {
	const url = absolutePublicFaceUrl('/api/Stats/public');
	const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
	if (!res.ok) {
		throw new Error(`Public stats HTTP ${res.status}`);
	}
	return (await res.json()) as PublicStatsSnapshot;
}

export function usePublicStatsSnapshot(enabled: boolean) {
	return useQuery({
		queryKey: ['stats', 'public', 'snapshot'],
		queryFn: fetchPublicStatsSnapshot,
		enabled,
		staleTime: 60_000,
	});
}
