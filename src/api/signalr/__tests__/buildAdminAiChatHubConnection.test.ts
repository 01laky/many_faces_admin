import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildAdminAiChatHubConnection } from '../buildAdminAiChatHubConnection';

const mockWithUrl = vi.fn().mockReturnThis();
const mockWithAutomaticReconnect = vi.fn().mockReturnThis();
const mockBuild = vi.fn(() => ({ id: 'admin-chat-hub' }));

vi.mock('@microsoft/signalr', () => ({
	HubConnectionBuilder: class MockHubConnectionBuilder {
		withUrl(...args: unknown[]) {
			mockWithUrl(...args);
			return this;
		}
		withAutomaticReconnect() {
			mockWithAutomaticReconnect();
			return this;
		}
		build() {
			return mockBuild();
		}
	},
}));

vi.mock('../../../config/env', () => ({
	env: { apiUrl: 'https://api.test', defaultFacePrefix: 'admin' },
}));

describe('buildAdminAiChatHubConnection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('targets admin chat hub with access token factory', () => {
		let current = 'jwt-admin';
		const conn = buildAdminAiChatHubConnection(() => current);

		expect(conn).toEqual({ id: 'admin-chat-hub' });
		expect(mockWithUrl).toHaveBeenCalledWith(
			'https://api.test/admin/hubs/chat',
			expect.objectContaining({
				accessTokenFactory: expect.any(Function),
			})
		);
		const factory = mockWithUrl.mock.calls[0]![1].accessTokenFactory as () => string;
		expect(factory()).toBe('jwt-admin');
		current = 'jwt-refreshed';
		expect(factory()).toBe('jwt-refreshed');
		expect(mockWithAutomaticReconnect).toHaveBeenCalled();
	});
});
