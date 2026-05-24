// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAppBootstrapReady } from '@/hooks/useAppBootstrapReady';

const useAuthMock = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: () => useAuthMock(),
}));

describe('useAppBootstrapReady GPL', () => {
	it('GPL-7: ready after auth session hydrate only', () => {
		useAuthMock.mockReturnValue({ isSessionHydrated: true });
		const { result } = renderHook(() => useAppBootstrapReady());
		expect(result.current.isReady).toBe(true);
		expect(result.current.flags.faceConfigReady).toBe(true);
	});

	it('GPL-9: blocks until auth hydrate completes', () => {
		useAuthMock.mockReturnValue({ isSessionHydrated: false });
		const { result } = renderHook(() => useAppBootstrapReady());
		expect(result.current.isReady).toBe(false);
	});

	it('GPL-10b: latch stays true while login sets isLoading', () => {
		useAuthMock.mockReturnValue({ isSessionHydrated: true, isLoading: true });
		const { result } = renderHook(() => useAppBootstrapReady());
		expect(result.current.flags.authSessionReady).toBe(true);
		expect(result.current.isReady).toBe(true);
	});
});
