import { isSuperAdminFromToken } from '../../utils/platformAccess';

/** Pure hub gating helpers mirroring ChatPage / UserChatPage effects (ASH1-C2…C4). */

export function shouldConnectAiChatHub(input: {
	loading: boolean;
	aiEnabled: boolean;
	isAuthenticated: boolean;
	token: string | null;
}): boolean {
	if (input.loading) return false;
	if (!input.aiEnabled) return false;
	if (!input.isAuthenticated || !input.token) return false;
	return true;
}

export function shouldConnectMessengerHub(input: {
	isAuthenticated: boolean;
	token: string | null;
}): boolean {
	if (!input.isAuthenticated || !input.token) return false;
	return isSuperAdminFromToken(input.token);
}
