import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { absoluteScopedUrl } from '../faceApiRouting';
import type { AccessTokenProvider } from './buildAdminAiChatHubConnection';

/** Builds the admin messenger SignalR hub (platform DMs with end users). */
export function buildAdminMessengerHubConnection(
	getAccessToken: AccessTokenProvider
): HubConnection {
	const hubUrl = absoluteScopedUrl('/hubs/messenger');
	return new HubConnectionBuilder()
		.withUrl(hubUrl, {
			accessTokenFactory: () => getAccessToken() ?? '',
		})
		.withAutomaticReconnect()
		.build();
}
