import {
	resolveEffectiveStatusBadge,
	resolveEffectiveStatusModifier,
	type EffectiveStatusBadge,
} from '@/utils/adminEffectiveStatus';

/** Badge keys under pages.settings.infra.push.config.status.* */
export type PushEffectiveStatusBadge = EffectiveStatusBadge;

/** Maps backend effectiveStatus → i18n badge key (APC-U5). */
export const resolvePushEffectiveStatusBadge = resolveEffectiveStatusBadge;

/** CSS modifier for push status strip rows. */
export const resolvePushEffectiveStatusModifier = resolveEffectiveStatusModifier;
