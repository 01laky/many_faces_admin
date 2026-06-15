import type { TFunction } from 'i18next';
import type { UiChatMessage, UiChatRole } from './operatorAiChatUtils';

export function formatLocaleBadge(t: TFunction, responseLocale: string | null | undefined): string {
	if (!responseLocale) return t('pages.chat.localeUnknown');
	const key = `pages.chat.localeBadge.${responseLocale.toLowerCase()}`;
	const translated = t(key);
	if (translated !== key) return translated;
	return responseLocale.toUpperCase();
}

/**
 * Format a server-measured request duration for the assistant message header.
 * `<1s` for sub-second responses (cache hit / count fast-path), whole seconds under a minute
 * (e.g. `3s`, `45s`), and `m:ss` from one minute up (e.g. `1:23`, `10:05`). Locale-neutral.
 */
export function formatMessageDuration(durationMs: number | null | undefined): string {
	if (durationMs == null || !Number.isFinite(durationMs) || durationMs < 0) return '';
	if (durationMs < 1000) return '<1s';
	const totalSeconds = Math.round(durationMs / 1000);
	if (totalSeconds < 60) return `${totalSeconds}s`;
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${String(seconds).padStart(2, '0')}`;
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

	// Assistant rows carry a server-measured request duration; show it next to the timestamp
	// (e.g. "AI · Jun 15, 2026, 9:29 AM · 3s"). User and legacy (null) rows show nothing extra.
	if (msg.role === 'ai') {
		const duration = formatMessageDuration(msg.durationMs);
		if (duration) parts.push(duration);
	}

	return parts.join(' · ');
}

export function roleLabel(t: TFunction, role: UiChatRole): string {
	return role === 'user' ? t('pages.chat.you') : t('pages.chat.ai');
}
