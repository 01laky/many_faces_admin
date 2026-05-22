export type AdminInfraWorkerConfigDto = {
	mail: { configured: boolean };
	push: { configured: boolean; registeredDeviceCount: number };
};
