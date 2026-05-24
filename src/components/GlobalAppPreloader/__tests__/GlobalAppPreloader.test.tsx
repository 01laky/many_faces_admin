// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlobalAppPreloader } from '@/components/GlobalAppPreloader';

vi.mock('react-loading-indicators', () => ({
	ThreeDot: () => <div data-testid="three-dot" />,
}));

describe('GlobalAppPreloader GPL', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn().mockImplementation((query: string) => ({
				matches: false,
				media: query,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			}))
		);
	});

	it('GPL-8: renders logo and spinner', () => {
		render(<GlobalAppPreloader />);
		expect(screen.getByTestId('global-app-preloader')).toBeTruthy();
		expect(document.querySelector('.main-logo')).toBeTruthy();
		expect(screen.getByTestId('three-dot')).toBeTruthy();
	});
});
