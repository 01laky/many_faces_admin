import type { OperatorAiWorkerHostProfile } from '@/api/models/OperatorAiWorkerHostDto';
import { adminAiLiveParallelDefaults } from './adminAiLiveParallelSettings';

const GB = 1024 ** 3;

export type LiveParallelHardwareRecommendation = {
	recommended: number;
	upperBound: number;
	basis: {
		gpuName?: string;
		vramBytes?: number;
		ramAvailableBytes?: number;
		logicalCores?: number;
		cpuOnly: boolean;
	};
};

function estimateModelVramGb(profile: OperatorAiWorkerHostProfile): number {
	const loaded = profile.aiRuntime?.ollamaLoadedModels?.[0]?.sizeVramBytes;
	if (loaded && loaded > 0) return loaded / GB;

	const modelSize = profile.aiRuntime?.ollamaModelDetail?.modelSizeBytes;
	if (modelSize && modelSize > 0) return Math.min(modelSize / GB, 8);

	const paramSize = profile.aiRuntime?.ollamaModelDetail?.parameterSize ?? '';
	if (paramSize.includes('13')) return 8;
	if (paramSize.includes('7')) return 4.5;
	return 4.5;
}

/** Hardware-based live parallel recommendation from the AI worker host profile. */
export function recommendLiveParallelBundleCalls(
	profile: OperatorAiWorkerHostProfile | null | undefined,
	clientMax: number = adminAiLiveParallelDefaults.MAX
): LiveParallelHardwareRecommendation | null {
	if (!profile || profile.scope !== 'host') return null;

	const primaryGpu = profile.gpu?.devices?.[0];
	const vramBytes = primaryGpu?.vramBytes ?? 0;
	const ramAvailable = profile.memory?.ramAvailableBytes ?? profile.memory?.ramTotalBytes ?? 0;
	const logicalCores = profile.cpu?.logicalCores ?? 0;
	const numGpu = profile.aiRuntime?.ollamaNumGpu;
	const cpuOnly = numGpu === 0 || profile.gpu?.cudaAvailable === false;

	let upperBound = clientMax;

	if (cpuOnly || !profile.gpu?.devices?.length) {
		upperBound = 1;
	} else if (vramBytes > 0) {
		const vramGb = vramBytes / GB;
		const modelVramGb = estimateModelVramGb(profile);
		const perCallGb = Math.max(modelVramGb * 0.55, 2);
		const vramSlots = Math.floor(Math.max(0, vramGb - 1.5) / perCallGb);
		upperBound = Math.min(upperBound, Math.max(1, vramSlots));
	} else {
		upperBound = Math.min(upperBound, 2);
	}

	if (ramAvailable > 0) {
		const ramSlots = Math.floor(ramAvailable / GB / 3);
		upperBound = Math.min(upperBound, Math.max(1, ramSlots));
	}

	if (logicalCores > 0) {
		const cpuSlots = Math.max(1, Math.floor(logicalCores / 4));
		upperBound = Math.min(upperBound, cpuSlots);
	}

	upperBound = Math.max(adminAiLiveParallelDefaults.MIN, Math.min(clientMax, upperBound));

	const recommended =
		upperBound >= 4 ? upperBound - 1 : upperBound >= 3 ? upperBound - 1 : upperBound;

	return {
		recommended: Math.max(adminAiLiveParallelDefaults.MIN, recommended),
		upperBound,
		basis: {
			gpuName: primaryGpu?.name,
			vramBytes: vramBytes > 0 ? vramBytes : undefined,
			ramAvailableBytes: ramAvailable > 0 ? ramAvailable : undefined,
			logicalCores: logicalCores > 0 ? logicalCores : undefined,
			cpuOnly,
		},
	};
}
