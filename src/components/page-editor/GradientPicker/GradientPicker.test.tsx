// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GradientPicker } from './GradientPicker';

const gradient = (colors: string[]) =>
	JSON.stringify({ type: 'linear', colors, angle: 90, animation: 'none', animationSpeed: 3 });

function lastEmittedColors(onChange: ReturnType<typeof vi.fn>): string[] {
	const lastArg = onChange.mock.calls.at(-1)?.[0] as string;
	return JSON.parse(lastArg).colors;
}

describe('GradientPicker', () => {
	it('removes the middle color and emits the remaining colors in order', () => {
		const onChange = vi.fn();
		render(
			<GradientPicker value={gradient(['#aaaaaa', '#bbbbbb', '#cccccc'])} onChange={onChange} />
		);

		const removeButtons = screen.getAllByTitle('pages.editFace.gradient.removeColor');
		expect(removeButtons).toHaveLength(3);
		fireEvent.click(removeButtons[1]);

		expect(lastEmittedColors(onChange)).toEqual(['#aaaaaa', '#cccccc']);
	});

	it('does not remove below two colors (no remove buttons at the minimum)', () => {
		const onChange = vi.fn();
		render(<GradientPicker value={gradient(['#aaaaaa', '#bbbbbb'])} onChange={onChange} />);
		expect(screen.queryAllByTitle('pages.editFace.gradient.removeColor')).toHaveLength(0);
	});

	it('adds a color and emits the extended list', () => {
		const onChange = vi.fn();
		render(<GradientPicker value={gradient(['#aaaaaa', '#bbbbbb'])} onChange={onChange} />);

		fireEvent.click(screen.getByText(/addColor/));

		expect(lastEmittedColors(onChange)).toEqual(['#aaaaaa', '#bbbbbb', '#000000']);
	});
});
