import { describe, expect, it } from 'vitest';
import type { OperatorAiWorkerHostProfile } from '@/api/models/OperatorAiWorkerHostDto';
import { recommendLiveParallelBundleCalls } from '../adminAiLiveParallelRecommendation';

const GB = 1024 ** 3;

function rtx3050Profile(): OperatorAiWorkerHostProfile {
	return {
		scope: 'host',
		hostname: 'LAPTOP-TEST',
		cpu: { logicalCores: 16, physicalCores: 8, modelName: 'Ryzen' },
		gpu: {
			devices: [{ name: 'NVIDIA GeForce RTX 3050 Laptop GPU', vramBytes: 8 * GB }],
			cudaAvailable: true,
		},
		memory: { ramTotalBytes: 32 * GB, ramAvailableBytes: 16 * GB },
		aiRuntime: {
			ollamaNumGpu: 999,
			ollamaModelDetail: { parameterSize: '7B', quantizationLevel: 'Q4_K_M' },
		},
	};
}

describe('recommendLiveParallelBundleCalls', () => {
	it('returns null for missing or container scope', () => {
		expect(recommendLiveParallelBundleCalls(null)).toBeNull();
		expect(recommendLiveParallelBundleCalls({ scope: 'container' })).toBeNull();
	});

	it('recommends 2 for RTX 3050 8GB class hardware', () => {
		const rec = recommendLiveParallelBundleCalls(rtx3050Profile());
		expect(rec).not.toBeNull();
		expect(rec!.recommended).toBe(2);
		expect(rec!.upperBound).toBe(2);
	});

	it('caps at 1 for CPU-only Ollama', () => {
		const profile = rtx3050Profile();
		profile.aiRuntime = { ...profile.aiRuntime, ollamaNumGpu: 0 };
		const rec = recommendLiveParallelBundleCalls(profile);
		expect(rec!.recommended).toBe(1);
		expect(rec!.upperBound).toBe(1);
		expect(rec!.basis.cpuOnly).toBe(true);
	});

	it('allows higher parallel on large VRAM GPU', () => {
		const profile = rtx3050Profile();
		profile.gpu!.devices![0].vramBytes = 24 * GB;
		profile.gpu!.devices![0].name = 'NVIDIA GeForce RTX 4090';
		profile.memory!.ramAvailableBytes = 48 * GB;
		const rec = recommendLiveParallelBundleCalls(profile);
		expect(rec!.upperBound).toBeGreaterThanOrEqual(4);
		expect(rec!.recommended).toBeLessThanOrEqual(rec!.upperBound);
	});
});
