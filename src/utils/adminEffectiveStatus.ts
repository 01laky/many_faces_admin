import type { InfraLastTestOutcome } from '@/utils/adminInfraStatusStrip';

/**
 * Shared effective-status mapping for the operator infra panels (mail + push). The mail/push wrappers
 * (`adminMailEffectiveStatus`, `adminPushEffectiveStatus`) re-export these under their domain-specific
 * names; the badge i18n keys live under `pages.settings.infra.{mail,push}.config.status.*`.
 */

/** Badge keys under pages.settings.infra.{mail,push}.config.status.* */
export type EffectiveStatusBadge = 'disabled' | 'incomplete' | 'configured' | 'notConfigured';

/** Maps backend effectiveStatus → i18n badge key (AMC-U5 / APC-U5). */
export function resolveEffectiveStatusBadge(
	effectiveStatus: string | undefined,
	configured?: boolean
): EffectiveStatusBadge {
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

/** CSS modifier for infra status strip rows. */
export function resolveEffectiveStatusModifier(
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
