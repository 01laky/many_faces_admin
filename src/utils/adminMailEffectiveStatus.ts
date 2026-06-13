import {
	resolveEffectiveStatusBadge,
	resolveEffectiveStatusModifier,
	type EffectiveStatusBadge,
} from '@/utils/adminEffectiveStatus';

/** Badge keys under pages.settings.infra.mail.config.status.* */
export type MailEffectiveStatusBadge = EffectiveStatusBadge;

/** Maps backend effectiveStatus → i18n badge key (AMC-U5). */
export const resolveMailEffectiveStatusBadge = resolveEffectiveStatusBadge;

/** CSS modifier for mail status strip rows. */
export const resolveMailEffectiveStatusModifier = resolveEffectiveStatusModifier;
