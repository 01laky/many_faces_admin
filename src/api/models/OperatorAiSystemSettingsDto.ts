/** Backend singleton for global operator AI availability (camelCase JSON). */
export type OperatorAiSystemSettingsDto = {
	aiEnabled: boolean;
	updatedAtUtc?: string;
	updatedByUserId?: string | null;
	lastEnabledAtUtc?: string | null;
	lastEnableHealthStatus?: string | null;
};
