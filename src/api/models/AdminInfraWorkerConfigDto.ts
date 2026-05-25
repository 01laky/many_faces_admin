export type AdminInfraWorkerConfigDto = {
	mail: { configured: boolean; effectiveStatus?: string | null };
	push: { configured: boolean; effectiveStatus?: string | null; registeredDeviceCount: number };
};
