import { buildUserChatQuery } from './userChatPaths';

/** Builds user-chat href for album detail header navigation (English slug). */
export function buildOpenChatPath(langPrefix: string, creatorId: string): string {
	return `${langPrefix}/user-chat${buildUserChatQuery(creatorId)}`;
}
