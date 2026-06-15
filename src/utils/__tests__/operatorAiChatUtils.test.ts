import { describe, expect, it } from 'vitest';
import {
	appendExchangeIfNew,
	conversationTitle,
	filterTransientStatusExchanges,
	formatOperatorAiModelLabel,
	appendExchangeToMessagesPage,
	isOperatorAiEphemeralReply,
	isTransientAiStatusContent,
	mapOperatorMessageToUi,
	mergeMessagePages,
	parseConversationIdFromSearch,
	truncateThreadTitle,
} from '../operatorAiChatUtils';

describe('operatorAiChatUtils', () => {
	it('formatOperatorAiModelLabel shortens model ids', () => {
		expect(formatOperatorAiModelLabel('org/model-Instruct-2507')).toBe('model');
		expect(formatOperatorAiModelLabel('qwen2.5:7b-instruct-q4_K_M')).toBe('qwen2.5:7b');
		expect(formatOperatorAiModelLabel('')).toBe('');
	});

	it('parseConversationIdFromSearch reads ?c=', () => {
		expect(parseConversationIdFromSearch('?c=42')).toBe(42);
		expect(parseConversationIdFromSearch('')).toBeNull();
		expect(parseConversationIdFromSearch('?c=abc')).toBeNull();
	});

	it('conversationTitle falls back to unnamed', () => {
		expect(conversationTitle(null, 'Untitled')).toBe('Untitled');
		expect(conversationTitle('  Hello  ', 'Untitled')).toBe('Hello');
	});

	it('mapOperatorMessageToUi maps roles', () => {
		expect(
			mapOperatorMessageToUi({
				id: 1,
				role: 'User',
				content: 'hi',
				statsMode: null,
				createdByUserId: 'u1',
				createdAt: '2026-01-01T00:00:00Z',
			}).role
		).toBe('user');
	});

	it('mapOperatorMessageToUi preserves header metadata (createdAt, authorEmail, responseLocale)', () => {
		// Regression: these fields were dropped, so loaded history rendered no timestamp/author
		// (formatMessageHeader reads createdAt + authorEmail).
		const ui = mapOperatorMessageToUi({
			id: 7,
			role: 'User',
			content: 'hello',
			statsMode: null,
			createdByUserId: 'u1',
			authorEmail: 'op@example.com',
			responseLocale: 'en',
			createdAt: '2026-01-02T03:04:05Z',
		});
		expect(ui).toEqual({
			id: 7,
			role: 'user',
			content: 'hello',
			authorEmail: 'op@example.com',
			responseLocale: 'en',
			createdAt: '2026-01-02T03:04:05Z',
		});
	});

	it('mergeMessagePages prepends without duplicates', () => {
		const existing = [{ id: 2, role: 'ai' as const, content: 'b' }];
		const older = [{ id: 1, role: 'user' as const, content: 'a' }];
		expect(mergeMessagePages(existing, older)).toEqual([
			{ id: 1, role: 'user', content: 'a' },
			{ id: 2, role: 'ai', content: 'b' },
		]);
	});

	it('isTransientAiStatusContent detects model loading placeholders', () => {
		expect(
			isTransientAiStatusContent(
				'⏳ AI model sa práve načítava do pamäte (prvé spustenie po rebuilde).'
			)
		).toBe(true);
		expect(isTransientAiStatusContent('Ahoj, som pripravený.')).toBe(false);
	});

	it('isTransientAiStatusContent hides legacy infrastructure errors', () => {
		expect(isTransientAiStatusContent('<urlopen error [Errno 111] Connection refused>')).toBe(true);
	});

	it('filterTransientStatusExchanges removes user+placeholder pairs', () => {
		const filtered = filterTransientStatusExchanges([
			{ id: 1, role: 'user', content: 'halo' },
			{
				id: 2,
				role: 'ai',
				content: '⏳ AI model sa práve načítava do pamäte.',
			},
			{ id: 3, role: 'user', content: 'test' },
			{ id: 4, role: 'ai', content: 'Skutočná odpoveď.' },
		]);
		expect(filtered).toEqual([
			{ id: 3, role: 'user', content: 'test' },
			{ id: 4, role: 'ai', content: 'Skutočná odpoveď.' },
		]);
	});

	it('isOperatorAiEphemeralReply detects hub validation errors', () => {
		expect(isOperatorAiEphemeralReply('Conversation not found. Start a new chat.')).toBe(true);
		expect(isOperatorAiEphemeralReply('Ahoj, tu sú štatistiky.')).toBe(false);
	});

	it('isOperatorAiEphemeralReply true when hubErrorCode set', () => {
		expect(isOperatorAiEphemeralReply('', 'invalid_locale')).toBe(true);
		expect(isOperatorAiEphemeralReply('Real answer', null)).toBe(false);
	});

	it('appendExchangeToMessagesPage appends without duplicate user id', () => {
		const user = {
			id: 10,
			role: 'User',
			content: 'q',
			statsMode: 'inline',
			createdByUserId: 'u',
			createdAt: '2026-01-01T00:00:00Z',
		};
		const assistant = {
			id: 11,
			role: 'Assistant',
			content: 'a',
			statsMode: 'inline',
			createdByUserId: null,
			createdAt: '2026-01-01T00:00:01Z',
		};
		const page = { items: [], hasMore: false, oldestId: null };
		const next = appendExchangeToMessagesPage(page, user, assistant);
		expect(next.items).toHaveLength(2);
		expect(appendExchangeToMessagesPage(next, user, assistant)).toBe(next);
	});

	it('appendExchangeIfNew skips duplicate user id', () => {
		const user = {
			id: 10,
			role: 'User',
			content: 'q',
			statsMode: null,
			createdByUserId: 'u',
			createdAt: '2026-01-01T00:00:00Z',
		};
		const assistant = {
			id: 11,
			role: 'Assistant',
			content: 'a',
			statsMode: null,
			createdByUserId: null,
			createdAt: '2026-01-01T00:00:01Z',
		};
		const base = [
			{ id: 10, role: 'user' as const, content: 'q' },
			{ id: 11, role: 'ai' as const, content: 'a' },
		];
		expect(appendExchangeIfNew(base, user, assistant)).toBe(base);
	});

	describe('truncateThreadTitle', () => {
		it('returns short titles unchanged (no ellipsis)', () => {
			expect(truncateThreadTitle('')).toBe('');
			expect(truncateThreadTitle('Short title')).toBe('Short title');
		});

		it('returns an exactly-24-char title unchanged', () => {
			const exact = 'Quarterly metrics review'; // 24 chars
			expect(exact).toHaveLength(24);
			expect(truncateThreadTitle(exact)).toBe(exact);
		});

		it('truncates to the first 24 chars + a single ellipsis', () => {
			const long = 'Quarterly metrics review and notes'; // 34 chars
			expect(truncateThreadTitle(long)).toBe('Quarterly metrics review…');
		});

		it('trims a trailing space before the ellipsis', () => {
			// char 25 is a space → after slicing 24 we keep "…23chars" then a trailing space is trimmed.
			const s = 'abcdefghijklmnopqrstuvw xyz'; // space at index 23, cut at 24
			expect(truncateThreadTitle(s)).toBe('abcdefghijklmnopqrstuvw…');
		});

		it('does not split an emoji / surrogate pair at the cut (code-point safe)', () => {
			// 24 leading chars then an astral emoji as the 25th code point → emoji dropped whole, not halved.
			const s = 'x'.repeat(24) + '😀tail';
			const out = truncateThreadTitle(s);
			expect(out).toBe('x'.repeat(24) + '…');
			expect(out).not.toContain('\ud83d'); // no lone high surrogate
		});

		it('honours a custom max', () => {
			expect(truncateThreadTitle('abcdef', 3)).toBe('abc…');
		});
	});
});
