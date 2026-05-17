import { describe, expect, it } from 'vitest';
import {
	appendExchangeIfNew,
	conversationTitle,
	filterTransientStatusExchanges,
	isTransientAiStatusContent,
	mapOperatorMessageToUi,
	mergeMessagePages,
	parseConversationIdFromSearch,
} from '../operatorAiChatUtils';

describe('operatorAiChatUtils', () => {
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
});
