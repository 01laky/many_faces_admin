// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContentMediaGrid } from '../ContentMediaGrid';
import type { ContentMediaItem } from '@/types/contentMedia';

/**
 * ADM-U3 (album prompt §9.1 / §9.2) — rendered-component coverage for the media grid:
 * the per-tile delete control must fire `onDeleteItem` only, never `onOpenPreview`.
 * `src/types/__tests__/contentMedia.test.ts` covers the pure `handleGridDeleteClick` helper;
 * this file exercises the wired-up DOM. Also used by StoryDetailPage (SDM-U11 gating).
 */

const items: ContentMediaItem[] = [
	{ id: 11, mediaType: 'Image', imageUrl: 'https://cdn.test/a.jpg', sortOrder: 0, title: 'First' },
	{
		id: 22,
		mediaType: 'Video',
		imageUrl: 'https://cdn.test/b.jpg',
		videoUrl: 'https://cdn.test/b.mp4',
		sortOrder: 1,
		title: 'Second',
	},
];

describe('ContentMediaGrid', () => {
	it('ADM-U3: delete click calls onDeleteItem with the tile id and never onOpenPreview', () => {
		const onOpenPreview = vi.fn();
		const onDeleteItem = vi.fn();
		render(
			<ContentMediaGrid
				items={items}
				showDelete
				onOpenPreview={onOpenPreview}
				onDeleteItem={onDeleteItem}
			/>
		);

		const deleteButtons = screen.getAllByRole('button', { name: 'pages.albumDetail.deleteMedia' });
		expect(deleteButtons).toHaveLength(2);

		fireEvent.click(deleteButtons[1]);
		expect(onDeleteItem).toHaveBeenCalledWith(22);
		expect(onOpenPreview).not.toHaveBeenCalled();
	});

	it('ADM-U3: tile click still opens the preview at that index', () => {
		const onOpenPreview = vi.fn();
		render(
			<ContentMediaGrid
				items={items}
				showDelete
				onOpenPreview={onOpenPreview}
				onDeleteItem={vi.fn()}
			/>
		);

		fireEvent.click(screen.getByRole('button', { name: 'Second' }));
		expect(onOpenPreview).toHaveBeenCalledWith(1);
	});

	it('SDM-U11 / ADM-U3: no delete controls when showDelete is false (non–super-admin)', () => {
		render(<ContentMediaGrid items={items} onOpenPreview={vi.fn()} onDeleteItem={vi.fn()} />);

		expect(screen.getByTestId('content-media-grid')).toBeTruthy();
		expect(screen.queryByRole('button', { name: 'pages.albumDetail.deleteMedia' })).toBeNull();
	});

	it('renders the empty-state copy instead of the grid when there is no media', () => {
		render(<ContentMediaGrid items={[]} onOpenPreview={vi.fn()} />);

		expect(screen.queryByTestId('content-media-grid')).toBeNull();
		expect(screen.getByText('pages.albumDetail.mediaEmpty')).toBeTruthy();
	});
});
