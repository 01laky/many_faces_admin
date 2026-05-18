import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { absoluteScopedUrl } from '../faceApiRouting';

/** Resolves the current JWT on each SignalR request (negotiate / reconnect). */
export type AccessTokenProvider = () => string | null;

/** Builds the admin AI chat SignalR hub (JWT via `accessTokenFactory`). */
export function buildAdminAiChatHubConnection(getAccessToken: AccessTokenProvider): HubConnection {
	const hubUrl = absoluteScopedUrl('/hubs/chat');
	return new HubConnectionBuilder()
		.withUrl(hubUrl, {
			accessTokenFactory: () => getAccessToken() ?? '',
		})
		.withAutomaticReconnect()
		.build();
}
