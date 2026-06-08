import type { TFunction } from 'i18next';
import type { UiChatMessage, UiChatRole } from './operatorAiChatUtils';

export function formatLocaleBadge(t: TFunction, responseLocale: string | null | undefined): string {
	if (!responseLocale) return t('pages.chat.localeUnknown');
	const key = `pages.chat.localeBadge.${responseLocale.toLowerCase()}`;
	const translated = t(key);
	if (translated !== key) return translated;
	return responseLocale.toUpperCase();
}

export function formatMessageHeader(
	t: TFunction,
	msg: UiChatMessage,
	viewerLanguage: string
): string {
	// RAG retrieval refactor v1 (D10): the operator chat is locale-free — the AI is no longer sent
	// a language and answers in English only. The per-message locale badge has been dropped from the
	// header. `formatLocaleBadge` is retained for any callers that still surface legacy locale data.
	const timestamp = msg.createdAt
		? new Intl.DateTimeFormat(viewerLanguage, {
				dateStyle: 'medium',
				timeStyle: 'short',
			}).format(new Date(msg.createdAt))
		: '';

	const parts: string[] = [];
	if (msg.role === 'user') {
		parts.push(msg.authorEmail?.trim() || t('pages.chat.you'));
	} else {
		parts.push(t('pages.chat.ai'));
	}
	if (timestamp) parts.push(timestamp);

	return parts.join(' · ');
}

export function roleLabel(t: TFunction, role: UiChatRole): string {
	return role === 'user' ? t('pages.chat.you') : t('pages.chat.ai');
}
