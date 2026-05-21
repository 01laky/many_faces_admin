import type {
	OperatorAiWorkerHostProfile,
	OperatorAiWorkerHostProfileDisk,
} from '@/api/models/OperatorAiWorkerHostDto';
import { formatBytes } from '@/utils/formatBytes';

export const WORKER_HOST_STALE_HOURS = 24;

export function formatWorkerHostBytes(value?: number): string {
	return formatBytes(value);
}

export function diskUsedPercent(disk: OperatorAiWorkerHostProfileDisk): number | null {
	if (!disk.totalBytes || disk.freeBytes == null) return null;
	const used = disk.totalBytes - disk.freeBytes;
	return Math.round((used / disk.totalBytes) * 100);
}

export function isWorkerHostProfileStale(
	profile: OperatorAiWorkerHostProfile | null | undefined,
	nowMs = Date.now()
): boolean {
	if (!profile?.collectedAtUtc) return false;
	const collected = Date.parse(profile.collectedAtUtc);
	if (Number.isNaN(collected)) return false;
	return nowMs - collected > WORKER_HOST_STALE_HOURS * 60 * 60 * 1000;
}

export function topWorkerHostDisks(
	disks: OperatorAiWorkerHostProfileDisk[] | undefined,
	limit = 3
) {
	if (!disks?.length) return [];
	return [...disks]
		.map((disk) => ({ disk, usedPct: diskUsedPercent(disk) ?? 0 }))
		.sort((a, b) => b.usedPct - a.usedPct)
		.slice(0, limit);
}

export function shouldShowWorkerHostUnreachableBanner(reachable?: boolean): boolean {
	return reachable === false;
}

export function shouldShowWorkerHostNoProfile(
	profile: OperatorAiWorkerHostProfile | null | undefined
): boolean {
	return profile == null;
}
