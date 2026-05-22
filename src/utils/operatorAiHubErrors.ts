import type { TFunction } from 'i18next';

const HUB_ERROR_KEYS: Record<string, string> = {
	invalid_locale: 'pages.chat.hub.errors.invalid_locale',
	not_operator: 'pages.chat.hub.errors.not_operator',
	conversation_not_found: 'pages.chat.hub.errors.conversation_not_found',
	message_too_long: 'pages.chat.hub.errors.message_too_long',
	rate_limited: 'pages.chat.hub.errors.rate_limited',
	model_loading: 'pages.chat.hub.errors.model_loading',
	ai_unavailable: 'pages.chat.hub.errors.ai_unavailable',
	ai_generation_failed: 'pages.chat.hub.errors.ai_generation_failed',
	ai_guard_rejected: 'pages.chat.hub.errors.ai_guard_rejected',
	ai_disabled: 'pages.chat.hub.errors.ai_disabled',
};

export function isKnownOperatorAiHubErrorCode(code: string | null | undefined): boolean {
	if (!code) return false;
	return code in HUB_ERROR_KEYS;
}

export function mapOperatorAiHubError(t: TFunction, code: string | null | undefined): string {
	if (!code || !isKnownOperatorAiHubErrorCode(code)) return '';
	return t(HUB_ERROR_KEYS[code]);
}
