export type AdminMailSmtpSettingsDto = {
	host: string;
	port: number;
	startTls: boolean;
	user?: string | null;
	hasPassword: boolean;
};

export type AdminMailFromSettingsDto = {
	email: string;
	displayName?: string | null;
};

export type AdminMailRegistrationLinksDto = {
	portalPublicBaseUrl: string;
	completeRegistrationPathTemplate: string;
	mobileDeepLinkBase: string;
	preferMobileDeepLinkWhenPlatformMobile: boolean;
};

export type AdminMailSettingsDto = {
	enabled: boolean;
	defaultLocale: string;
	workerGrpcUrl?: string | null;
	hasWorkerAuthToken: boolean;
	smtp: AdminMailSmtpSettingsDto;
	from: AdminMailFromSettingsDto;
	registrationLinks: AdminMailRegistrationLinksDto;
	effectiveStatus: string;
	updatedAtUtc: string;
	updatedByUserId?: string | null;
};

export type UpdateAdminMailSmtpRequest = {
	host?: string | null;
	port?: number | null;
	startTls?: boolean | null;
	user?: string | null;
	/** Omit to keep; empty string clears. */
	password?: string | null;
};

export type UpdateAdminMailFromRequest = {
	email?: string | null;
	displayName?: string | null;
};

export type UpdateAdminMailRegistrationLinksRequest = {
	portalPublicBaseUrl?: string | null;
	completeRegistrationPathTemplate?: string | null;
	mobileDeepLinkBase?: string | null;
	preferMobileDeepLinkWhenPlatformMobile?: boolean | null;
};

export type UpdateAdminMailSettingsRequest = {
	enabled: boolean;
	defaultLocale?: string | null;
	workerGrpcUrl?: string | null;
	/** Omit to keep; empty string clears. */
	workerAuthToken?: string | null;
	smtp?: UpdateAdminMailSmtpRequest | null;
	from?: UpdateAdminMailFromRequest | null;
	registrationLinks?: UpdateAdminMailRegistrationLinksRequest | null;
};

export type AdminMailTestSmtpResultDto = {
	smtpReachable: boolean;
	message?: string | null;
};
