import { describe, expect, it, vi } from 'vitest';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { buildAdminAiChatHubConnection } from '../buildAdminAiChatHubConnection';
import { resolveHubAccessToken } from '@/utils/authStorage';

const withUrlSpy = vi.spyOn(HubConnectionBuilder.prototype, 'withUrl');

describe('SignalR hub URL (ASH1-T-C01, C06)', () => {
	it('ASH1-T-C01: buildAdminAiChatHubConnection registers scoped chat hub URL', () => {
		withUrlSpy.mockClear();
		buildAdminAiChatHubConnection(() => 'jwt');
		expect(withUrlSpy).toHaveBeenCalled();
		const hubUrl = withUrlSpy.mock.calls.at(-1)?.[0] as string;
		expect(hubUrl).toContain('/hubs/chat');
	});

	it('ASH1-T-C06: resolveHubAccessToken prefers in-memory ref', () => {
		const storage = {
			getItem: () => 'stored-jwt',
			setItem: vi.fn(),
			removeItem: vi.fn(),
		};
		expect(resolveHubAccessToken('live-jwt', storage)).toBe('live-jwt');
	});
});
