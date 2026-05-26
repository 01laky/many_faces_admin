export const operatorUserChatConversationsKey = ['operatorUserChat', 'conversations'] as const;

export const messagesKey = (userId: string) => ['operatorUserChat', 'messages', userId] as const;

export const existsKey = (userId: string) => ['operatorUserChat', 'exists', userId] as const;
