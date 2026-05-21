export type OperatorAiWorkerHostProfileGpuDevice = {
	name?: string;
	vendor?: string;
	vramBytes?: number;
	driverVersion?: string;
};

export type OperatorAiWorkerHostProfileDisk = {
	mountPoint?: string;
	totalBytes?: number;
	freeBytes?: number;
	fsType?: string;
};

export type OperatorAiWorkerHostProfileOllamaDetail = {
	family?: string;
	parameterSize?: string;
	quantizationLevel?: string;
	modelSizeBytes?: number;
	format?: string;
};

export type OperatorAiWorkerHostProfileLoadedModel = {
	name?: string;
	sizeBytes?: number;
	sizeVramBytes?: number;
	processor?: string;
	expiresAtUtc?: string;
};

export type OperatorAiWorkerHostProfile = {
	schemaVersion?: number;
	workerInstanceId?: string;
	collectedAtUtc?: string;
	scope?: string;
	hostname?: string;
	os?: {
		family?: string;
		version?: string;
		arch?: string;
		displayName?: string;
	};
	cpu?: {
		logicalCores?: number;
		physicalCores?: number;
		modelName?: string;
		maxFrequencyMhz?: number;
	};
	gpu?: {
		devices?: OperatorAiWorkerHostProfileGpuDevice[];
		cudaAvailable?: boolean;
	};
	memory?: {
		ramTotalBytes?: number;
		ramAvailableBytes?: number;
		swapTotalBytes?: number;
		swapUsedBytes?: number;
	};
	disks?: OperatorAiWorkerHostProfileDisk[];
	aiRuntime?: {
		ollamaBaseUrl?: string;
		ollamaModelConfigured?: string;
		ollamaReachable?: boolean;
		ollamaContextLength?: number;
		ollamaNumGpu?: number;
		ollamaModelDetail?: OperatorAiWorkerHostProfileOllamaDetail;
		ollamaLoadedModels?: OperatorAiWorkerHostProfileLoadedModel[];
		pythonVersion?: string;
		grpcPort?: number;
	};
};

export type OperatorAiWorkerHostDto = {
	reachable?: boolean;
	lastRefreshAttemptUtc?: string | null;
	lastRefreshError?: string | null;
	grpcAddressConfigured?: string | null;
	profile?: OperatorAiWorkerHostProfile | null;
};
