// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlobalAppPreloader } from '@/components/GlobalAppPreloader';

vi.mock('react-loading-indicators', () => ({
	ThreeDot: () => <div data-testid="three-dot" />,
}));

describe('GlobalAppPreloader GPL', () => {
	it('GPL-8: renders logo and spinner', () => {
		render(<GlobalAppPreloader />);
		expect(screen.getByTestId('global-app-preloader')).toBeTruthy();
		expect(document.querySelector('.main-logo')).toBeTruthy();
		expect(screen.getByTestId('three-dot')).toBeTruthy();
	});

	it('GPL-20: uses fixed bootstrap overlay and spinner slot', () => {
		render(<GlobalAppPreloader />);
		expect(document.querySelector('.global-app-preloader--bootstrap')).toBeTruthy();
		expect(document.querySelector('.global-app-preloader__spinner')).toBeTruthy();
	});
});
