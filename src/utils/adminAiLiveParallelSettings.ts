const STORAGE_KEY = 'admin_ai_live_max_parallel_bundle_calls';
const DEFAULT = 2;
const MIN = 1;
const MAX = 8;

/** Max concurrent per-bundle AI calls when stats mode is live (v1 localStorage). */
export function getAdminAiLiveMaxParallelBundleCalls(): number {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)?.trim();
		if (!raw) return DEFAULT;
		const n = Number.parseInt(raw, 10);
		if (!Number.isFinite(n)) return DEFAULT;
		return Math.min(MAX, Math.max(MIN, n));
	} catch {
		return DEFAULT;
	}
}

export function setAdminAiLiveMaxParallelBundleCalls(value: number): void {
	const clamped = Math.min(MAX, Math.max(MIN, Math.round(value)));
	try {
		localStorage.setItem(STORAGE_KEY, String(clamped));
	} catch {
		/* ignore */
	}
}

export const adminAiLiveParallelDefaults = { STORAGE_KEY, DEFAULT, MIN, MAX } as const;
