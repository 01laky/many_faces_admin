import { describe, expect, it } from 'vitest';
import { formatLocaleBadge, formatMessageDuration, formatMessageHeader } from '../operatorAiLocale';

const t = (key: string) => {
	if (key === 'pages.chat.you') return 'You';
	if (key === 'pages.chat.ai') return 'AI';
	if (key === 'pages.chat.localeUnknown') return '—';
	if (key.startsWith('pages.chat.localeBadge.')) return key.split('.').pop()!.toUpperCase();
	return key;
};

describe('operatorAiLocale', () => {
	it('formatLocaleBadge returns uppercase fallback', () => {
		expect(formatLocaleBadge(t, 'en')).toBe('EN');
	});

	// RAG retrieval refactor v1 (D10): the chat is locale-free; the header no longer renders the
	// per-message locale badge, even when legacy persisted messages still carry `responseLocale`.
	it('formatMessageHeader for user includes email but NOT a locale badge', () => {
		const header = formatMessageHeader(
			t,
			{
				id: 1,
				role: 'user',
				content: 'Hi',
				authorEmail: 'admin@admin.com',
				responseLocale: 'en',
				createdAt: '2026-05-18T15:00:00.000Z',
			},
			'en'
		);
		expect(header).toContain('admin@admin.com');
		expect(header).not.toContain('EN');
	});

	it('formatMessageHeader for assistant uses AI label without a locale badge', () => {
		const header = formatMessageHeader(
			t,
			{
				id: 2,
				role: 'ai',
				content: 'Hello',
				responseLocale: 'sk',
				createdAt: '2026-05-18T15:01:00.000Z',
			},
			'en'
		);
		expect(header.startsWith('AI')).toBe(true);
		expect(header).not.toContain('SK');
	});

	it('formatMessageDuration formats sub-second, seconds and m:ss', () => {
		expect(formatMessageDuration(null)).toBe('');
		expect(formatMessageDuration(undefined)).toBe('');
		expect(formatMessageDuration(-5)).toBe('');
		expect(formatMessageDuration(0)).toBe('<1s');
		expect(formatMessageDuration(999)).toBe('<1s');
		expect(formatMessageDuration(1000)).toBe('1s');
		expect(formatMessageDuration(3200)).toBe('3s');
		expect(formatMessageDuration(45_000)).toBe('45s');
		expect(formatMessageDuration(59_000)).toBe('59s');
		expect(formatMessageDuration(60_000)).toBe('1:00');
		expect(formatMessageDuration(83_000)).toBe('1:23');
		expect(formatMessageDuration(605_000)).toBe('10:05');
	});

	it('formatMessageHeader appends duration for assistant rows, omits it for user/legacy rows', () => {
		const durationToken = /·\s(?:<1s|\d+s|\d+:\d{2})$/;

		const ai = formatMessageHeader(
			t,
			{ id: 3, role: 'ai', content: 'Hi', createdAt: '2026-06-15T09:29:00.000Z', durationMs: 3200 },
			'en'
		);
		expect(ai).toMatch(/·\s3s$/);

		// User row: no duration even if (erroneously) present.
		const user = formatMessageHeader(
			t,
			{
				id: 4,
				role: 'user',
				content: 'Q',
				authorEmail: 'a@b.com',
				createdAt: '2026-06-15T09:29:00.000Z',
				durationMs: 9999,
			},
			'en'
		);
		expect(user).not.toMatch(durationToken);

		// Legacy assistant row (null duration): no extra token.
		const legacy = formatMessageHeader(
			t,
			{ id: 5, role: 'ai', content: 'Hi', createdAt: '2026-06-15T09:29:00.000Z', durationMs: null },
			'en'
		);
		expect(legacy).not.toMatch(durationToken);
	});
});
