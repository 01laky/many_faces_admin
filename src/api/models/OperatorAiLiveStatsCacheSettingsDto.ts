/** Server-side live stats Redis cache TTL (milliseconds). */
export type OperatorAiLiveStatsCacheSettingsDto = {
	ttlMilliseconds: number;
	defaultTtlMilliseconds: number;
	minTtlMilliseconds: number;
	maxTtlMilliseconds: number;
};
