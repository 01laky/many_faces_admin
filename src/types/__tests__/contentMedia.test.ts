import { describe, it, expect, vi } from 'vitest';
import { handleGridDeleteClick, isVideoMediaItem } from '../contentMedia';

describe('contentMedia', () => {
	it('identifies video items for modal player (ADM-U4)', () => {
		expect(isVideoMediaItem({ mediaType: 'Video' } as never)).toBe(true);
		expect(isVideoMediaItem({ mediaType: 'Image' } as never)).toBe(false);
	});

	it('stopPropagation on grid delete (ADM-U3)', () => {
		const stop = vi.fn();
		const onDelete = vi.fn();
		handleGridDeleteClick({ stopPropagation: stop }, onDelete);
		expect(stop).toHaveBeenCalled();
		expect(onDelete).toHaveBeenCalled();
	});
});
