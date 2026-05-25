import type { InfraLastTestOutcome } from '@/utils/adminInfraStatusStrip';

/** Badge keys under pages.settings.infra.push.config.status.* */
export type PushEffectiveStatusBadge = 'disabled' | 'incomplete' | 'configured' | 'notConfigured';

/** Maps backend effectiveStatus → i18n badge key (APC-U5). */
export function resolvePushEffectiveStatusBadge(
	effectiveStatus: string | undefined,
	configured?: boolean
): PushEffectiveStatusBadge {
	switch (effectiveStatus?.toLowerCase()) {
		case 'disabled':
			return 'disabled';
		case 'incomplete':
			return 'incomplete';
		case 'configured':
			return 'configured';
		default:
			return configured ? 'configured' : 'notConfigured';
	}
}

/** CSS modifier for push status strip rows. */
export function resolvePushEffectiveStatusModifier(
	effectiveStatus: string | undefined,
	opts?: { lastTest?: InfraLastTestOutcome }
): 'ok' | 'warn' | 'off' {
	const normalized = effectiveStatus?.toLowerCase();
	if (normalized === 'disabled') return 'off';
	if (normalized === 'incomplete' || normalized === 'degraded' || normalized === 'unreachable') {
		return 'warn';
	}
	if (opts?.lastTest?.kind === 'failure') return 'warn';
	if (normalized === 'configured') return 'ok';
	return 'warn';
}
