import type { AdminInfraWorkerConfigDto } from '@/api/models/AdminInfraWorkerConfigDto';

export type InfraLastTestOutcome =
	| { kind: 'none' }
	| { kind: 'success'; at: Date; detail: string }
	| { kind: 'failure'; at: Date; message: string };

export type InfraConfiguredBadge = 'configured' | 'notConfigured';

/** Worker-config flag → status strip configured badge. */
export function resolveInfraConfiguredBadge(configured: boolean | undefined): InfraConfiguredBadge {
	return configured ? 'configured' : 'notConfigured';
}

/** CSS modifier for configured / device-count / last-test rows. */
export function resolveInfraStatusModifier(
	configured: boolean | undefined,
	opts?: { deviceCount?: number; lastTest?: InfraLastTestOutcome }
): 'ok' | 'warn' | 'off' {
	if (configured === false) return 'off';
	if (opts?.lastTest?.kind === 'failure') return 'warn';
	if (opts?.deviceCount === 0) return 'warn';
	return 'ok';
}

export function readMailConfigured(
	config: AdminInfraWorkerConfigDto | undefined
): boolean | undefined {
	return config?.mail.configured;
}

export function readMailEffectiveStatus(
	config: AdminInfraWorkerConfigDto | undefined
): string | undefined {
	return config?.mail.effectiveStatus ?? undefined;
}

export function readPushConfigured(
	config: AdminInfraWorkerConfigDto | undefined
): boolean | undefined {
	return config?.push.configured;
}

export function readPushDeviceCount(
	config: AdminInfraWorkerConfigDto | undefined
): number | undefined {
	return config?.push.registeredDeviceCount;
}

export function readPushEffectiveStatus(
	config: AdminInfraWorkerConfigDto | undefined
): string | undefined {
	return config?.push.effectiveStatus ?? undefined;
}
