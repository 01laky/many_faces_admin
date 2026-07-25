// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContentMediaPreviewModal } from '../ContentMediaPreviewModal';
import type { ContentMediaItem } from '@/types/contentMedia';

/**
 * ADM-U4 (album prompt §9.1 / §9.2) — rendered-component coverage for the shared preview modal:
 * a `mediaType=Video` item must play through a real `<video>` element, an image through `<img>`.
 * `src/types/__tests__/contentMedia.test.ts` covers the pure `isVideoMediaItem` predicate.
 * The `showDelete` assertions below back RDM-U9 (reel detail passes `showDelete={false}`).
 */

const imageItem: ContentMediaItem = {
	id: 1,
	mediaType: 'Image',
	imageUrl: 'https://cdn.test/photo.jpg',
	sortOrder: 0,
	title: 'Photo',
};

const videoItem: ContentMediaItem = {
	id: 2,
	mediaType: 'Video',
	imageUrl: 'https://cdn.test/poster.jpg',
	videoUrl: 'https://cdn.test/clip.mp4',
	sortOrder: 1,
	title: 'Clip',
};

describe('ContentMediaPreviewModal', () => {
	it('ADM-U4: renders a <video> for a Video item, poster from imageUrl', () => {
		render(
			<ContentMediaPreviewModal
				show
				items={[imageItem, videoItem]}
				index={1}
				onIndexChange={vi.fn()}
				onClose={vi.fn()}
			/>
		);

		const video = document.querySelector('video');
		expect(video).not.toBeNull();
		expect(video?.getAttribute('src')).toBe('https://cdn.test/clip.mp4');
		expect(video?.getAttribute('poster')).toBe('https://cdn.test/poster.jpg');
		expect(document.querySelector('[data-testid="preview-viewer"] img')).toBeNull();
	});

	it('ADM-U4: renders an <img> for an Image item and no <video>', () => {
		render(
			<ContentMediaPreviewModal
				show
				items={[imageItem, videoItem]}
				index={0}
				onIndexChange={vi.fn()}
				onClose={vi.fn()}
			/>
		);

		expect(document.querySelector('video')).toBeNull();
		expect(document.querySelector('[data-testid="preview-viewer"] img')?.getAttribute('src')).toBe(
			'https://cdn.test/photo.jpg'
		);
	});

	it('ADM-U2: next/prev buttons wrap the index at the collection bounds', () => {
		const onIndexChange = vi.fn();
		render(
			<ContentMediaPreviewModal
				show
				items={[imageItem, videoItem]}
				index={1}
				onIndexChange={onIndexChange}
				onClose={vi.fn()}
			/>
		);

		fireEvent.click(screen.getByRole('button', { name: 'pages.albumDetail.previewNext' }));
		expect(onIndexChange).toHaveBeenCalledWith(0);

		onIndexChange.mockClear();
		fireEvent.click(screen.getByRole('button', { name: 'pages.albumDetail.previewPrev' }));
		expect(onIndexChange).toHaveBeenCalledWith(0);
	});

	it('RDM-U9: no delete-from-preview control when showDelete is false', () => {
		render(
			<ContentMediaPreviewModal
				show
				items={[videoItem]}
				index={0}
				onIndexChange={vi.fn()}
				onClose={vi.fn()}
				showDelete={false}
				onDeleteCurrent={vi.fn()}
			/>
		);

		expect(
			screen.queryByRole('button', { name: 'pages.albumDetail.deleteFromPreview' })
		).toBeNull();
	});

	it('ADM-U4: delete-from-preview is offered and wired when showDelete is true', () => {
		const onDeleteCurrent = vi.fn();
		render(
			<ContentMediaPreviewModal
				show
				items={[videoItem]}
				index={0}
				onIndexChange={vi.fn()}
				onClose={vi.fn()}
				showDelete
				onDeleteCurrent={onDeleteCurrent}
			/>
		);

		fireEvent.click(screen.getByRole('button', { name: 'pages.albumDetail.deleteFromPreview' }));
		expect(onDeleteCurrent).toHaveBeenCalledTimes(1);
	});

	it('renders nothing when the index points past the end of the collection', () => {
		render(
			<ContentMediaPreviewModal
				show
				items={[]}
				index={0}
				onIndexChange={vi.fn()}
				onClose={vi.fn()}
			/>
		);

		expect(screen.queryByTestId('preview-viewer')).toBeNull();
	});
});
