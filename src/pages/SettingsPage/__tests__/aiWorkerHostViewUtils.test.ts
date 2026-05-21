import { describe, it, expect } from 'vitest';
import {
	formatWorkerHostBytes,
	isWorkerHostProfileStale,
	shouldShowWorkerHostNoProfile,
	shouldShowWorkerHostUnreachableBanner,
	topWorkerHostDisks,
	WORKER_HOST_STALE_HOURS,
} from '../aiWorkerHostViewUtils';

describe('aiWorkerHostViewUtils', () => {
	it('HP-A1 formats profile hardware summary fields', () => {
		expect(formatWorkerHostBytes(32 * 1024 ** 3)).toBe('32 GB');
		const disks = topWorkerHostDisks([
			{ mountPoint: '/data', totalBytes: 100, freeBytes: 10 },
			{ mountPoint: '/', totalBytes: 100, freeBytes: 50 },
		]);
		expect(disks[0].disk.mountPoint).toBe('/data');
		expect(disks[0].usedPct).toBe(90);
	});

	it('HP-A2 detects unreachable state', () => {
		expect(shouldShowWorkerHostUnreachableBanner(false)).toBe(true);
		expect(shouldShowWorkerHostUnreachableBanner(true)).toBe(false);
	});

	it('HP-A3 detects missing profile', () => {
		expect(shouldShowWorkerHostNoProfile(null)).toBe(true);
		expect(shouldShowWorkerHostNoProfile(undefined)).toBe(true);
		expect(shouldShowWorkerHostNoProfile({ hostname: 'x' })).toBe(false);
	});

	it('marks profile stale after configured hours', () => {
		const now = Date.parse('2026-05-22T12:00:00Z');
		const fresh = { collectedAtUtc: '2026-05-22T10:00:00Z' };
		const stale = { collectedAtUtc: '2026-05-20T10:00:00Z' };
		expect(isWorkerHostProfileStale(fresh, now)).toBe(false);
		expect(isWorkerHostProfileStale(stale, now)).toBe(true);
		expect(WORKER_HOST_STALE_HOURS).toBe(24);
	});
});
