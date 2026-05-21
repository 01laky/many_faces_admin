/** Minutes ↔ milliseconds helpers for live stats Redis cache TTL (Admin Settings). */
export const liveStatsCacheDefaults = {
	DEFAULT_MINUTES: 5,
	MIN_MINUTES: 1,
	MAX_MINUTES: 60,
} as const;

export function minutesToTtlMilliseconds(minutes: number): number {
	return Math.round(minutes * 60_000);
}

export function ttlMillisecondsToMinutes(ttlMilliseconds: number): number {
	return Math.round(ttlMilliseconds / 60_000);
}

export function clampLiveStatsCacheMinutes(minutes: number, minMs: number, maxMs: number): number {
	const minMinutes = Math.ceil(minMs / 60_000);
	const maxMinutes = Math.floor(maxMs / 60_000);
	return Math.min(Math.max(minutes, minMinutes), maxMinutes);
}
