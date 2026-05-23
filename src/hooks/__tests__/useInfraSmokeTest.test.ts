// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInfraSmokeTest } from '../useInfraSmokeTest';

vi.mock('react-toastify', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

describe('useInfraSmokeTest (REF-I1…I3)', () => {
	it('REF-I1: does not mutate when confirm resolves false', async () => {
		const confirm = vi.fn().mockResolvedValue(undefined);
		const mutateAsync = vi.fn();
		const t = (key: string) => key;

		const { result } = renderHook(() =>
			useInfraSmokeTest({
				confirm,
				t,
				messageKey: 'msg',
				cancelLabelKey: 'cancel',
				confirmLabelKey: 'ok',
				successToastKey: 'success',
				mutateAsync,
				getSuccessDetail: () => 'detail',
				resolveError: () => 'err',
			})
		);

		await act(async () => {
			await result.current.runTest();
		});

		expect(confirm).toHaveBeenCalled();
		expect(mutateAsync).not.toHaveBeenCalled();
		expect(result.current.lastTest.kind).toBe('none');
	});

	it('REF-I2: success sets lastTest and lastResult', async () => {
		const confirm = vi.fn(async ({ confirmAction }) => {
			await confirmAction();
		});
		const mutateAsync = vi.fn().mockResolvedValue({ correlationId: 'cid-1' });
		const t = (key: string) => key;

		const { result } = renderHook(() =>
			useInfraSmokeTest({
				confirm,
				t,
				messageKey: 'msg',
				cancelLabelKey: 'cancel',
				confirmLabelKey: 'ok',
				successToastKey: 'success',
				mutateAsync,
				getSuccessDetail: (r) => r.correlationId,
				resolveError: () => 'err',
			})
		);

		await act(async () => {
			await result.current.runTest();
		});

		expect(result.current.lastTest.kind).toBe('success');
		expect(result.current.lastTest).toMatchObject({ detail: 'cid-1' });
		expect(result.current.lastResult).toEqual({ correlationId: 'cid-1' });
	});

	it('REF-I3: failure sets lastTest kind failure and rethrows', async () => {
		const confirm = vi.fn(async ({ confirmAction }) => {
			await expect(confirmAction()).rejects.toThrow('fail');
		});
		const mutateAsync = vi.fn().mockRejectedValue(new Error('fail'));
		const t = (key: string) => key;

		const { result } = renderHook(() =>
			useInfraSmokeTest({
				confirm,
				t,
				messageKey: 'msg',
				cancelLabelKey: 'cancel',
				confirmLabelKey: 'ok',
				successToastKey: 'success',
				mutateAsync,
				getSuccessDetail: () => 'x',
				resolveError: () => 'resolved',
			})
		);

		await act(async () => {
			await result.current.runTest();
		});

		expect(result.current.lastTest.kind).toBe('failure');
		expect(result.current.lastTest).toMatchObject({ message: 'resolved' });
	});
});
