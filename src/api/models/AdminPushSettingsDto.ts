export type AdminPushFirebaseSettingsDto = {
	projectId?: string | null;
	hasCredentials: boolean;
};

export type AdminPushDefaultsSettingsDto = {
	titleLocKey: string;
	bodyLocKey: string;
	androidChannelId?: string | null;
};

export type AdminPushTransportSettingsDto = {
	tlsConfiguredViaEnv: boolean;
	mtlsConfiguredViaEnv: boolean;
};

export type AdminPushSettingsDto = {
	enabled: boolean;
	workerGrpcUrl?: string | null;
	hasWorkerAuthToken: boolean;
	firebase: AdminPushFirebaseSettingsDto;
	defaults: AdminPushDefaultsSettingsDto;
	grpcDeadlineSeconds: number;
	transport: AdminPushTransportSettingsDto;
	effectiveStatus: string;
	updatedAtUtc: string;
	updatedByUserId?: string | null;
};

export type UpdateAdminPushFirebaseRequest = {
	/** Omit to keep; empty string clears. */
	serviceAccountJson?: string | null;
};

export type UpdateAdminPushDefaultsRequest = {
	titleLocKey?: string | null;
	bodyLocKey?: string | null;
	androidChannelId?: string | null;
};

export type UpdateAdminPushSettingsRequest = {
	enabled: boolean;
	workerGrpcUrl?: string | null;
	/** Omit to keep; empty string clears. */
	workerAuthToken?: string | null;
	firebase?: UpdateAdminPushFirebaseRequest | null;
	defaults?: UpdateAdminPushDefaultsRequest | null;
	grpcDeadlineSeconds?: number | null;
};

export type TestAdminPushFcmRequest = {
	firebase?: UpdateAdminPushFirebaseRequest | null;
};

export type AdminPushTestFcmResultDto = {
	fcmReachable: boolean;
	projectId?: string | null;
	message?: string | null;
};
