export const adminAiLiveParallelDefaults = {
	DEFAULT: 2,
	MIN: 1,
	MAX: 8,
} as const;

export function clampLiveParallelBundleCalls(value: number): number {
	return Math.min(
		adminAiLiveParallelDefaults.MAX,
		Math.max(adminAiLiveParallelDefaults.MIN, Math.round(value))
	);
}

export function normalizeLiveParallelBundleCalls(
	value: number | null | undefined,
	fallback: number = adminAiLiveParallelDefaults.DEFAULT
): number {
	if (value == null || !Number.isFinite(value)) return clampLiveParallelBundleCalls(fallback);
	return clampLiveParallelBundleCalls(value);
}
