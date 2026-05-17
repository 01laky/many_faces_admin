import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { absoluteScopedUrl } from '../faceApiRouting';

/** Builds the admin AI chat SignalR hub (JWT via `accessTokenFactory`). */
export function buildAdminAiChatHubConnection(accessToken: string): HubConnection {
	const hubUrl = absoluteScopedUrl('/hubs/chat');
	return new HubConnectionBuilder()
		.withUrl(hubUrl, {
			accessTokenFactory: () => accessToken,
		})
		.withAutomaticReconnect()
		.build();
}
