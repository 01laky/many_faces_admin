export type AdminAiPublicStatsMode = 'off' | 'inline' | 'live';

export const adminAiPublicStatsDefaults = {
	DEFAULT_MODE: 'inline' as const,
} as const;

const VALID: ReadonlySet<AdminAiPublicStatsMode> = new Set(['off', 'inline', 'live']);

export function normalizeAdminAiPublicStatsMode(
	raw: string | null | undefined
): AdminAiPublicStatsMode {
	const normalized = raw?.trim().toLowerCase();
	if (normalized && VALID.has(normalized as AdminAiPublicStatsMode)) {
		return normalized as AdminAiPublicStatsMode;
	}
	return adminAiPublicStatsDefaults.DEFAULT_MODE;
}

export function isAdminAiPublicStatsMode(value: string): value is AdminAiPublicStatsMode {
	return VALID.has(value as AdminAiPublicStatsMode);
}
