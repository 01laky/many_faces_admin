// @vitest-environment happy-dom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlobalSearchAutocomplete } from './GlobalSearchAutocomplete';
import type { AdminSearchHitDto } from '@/api/models/AdminSearchAutocompleteDto';

const mockNavigate = vi.fn();
const mockReset = vi.fn();
const mockSetQuery = vi.fn();
const mockLoadMore = vi.fn();

let mockSearchState = {
	query: '',
	setQuery: mockSetQuery,
	debouncedQuery: '',
	selectedTypes: [] as string[],
	setSelectedTypes: vi.fn(),
	toggleEntityType: vi.fn(),
	hits: [] as AdminSearchHitDto[],
	hasMore: false,
	nextOffset: 0,
	searchAvailable: true,
	message: null as string | null,
	status: 'idle' as const,
	loadMore: mockLoadMore,
	reset: mockReset,
};

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
		useParams: () => ({ lang: 'en' }),
	};
});

vi.mock('@/hooks/useLocalizedLink', () => ({
	useLocalizedLink: () => (path: string) => `/en${path.startsWith('/') ? path : `/${path}`}`,
}));

vi.mock('@/hooks/api/useAdminGlobalSearch', () => ({
	useAdminGlobalSearch: () => mockSearchState,
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, opts?: { query?: string; defaultValue?: string }) => {
			if (key === 'globalSearch.placeholder') return 'Search platform…';
			if (key === 'globalSearch.toggle') return 'Search platform';
			if (key === 'globalSearch.noResults') return `No results for "${opts?.query ?? ''}"`;
			if (key === 'globalSearch.unavailable') return 'Search is unavailable';
			if (key === 'globalSearch.loading') return 'Searching…';
			if (key === 'globalSearch.loadingMore') return 'Loading more…';
			if (key.startsWith('globalSearch.entityType.')) {
				return opts?.defaultValue ?? key.split('.').pop() ?? key;
			}
			return key;
		},
		i18n: { language: 'en' },
	}),
}));

class MockIntersectionObserver {
	callback: IntersectionObserverCallback;
	constructor(callback: IntersectionObserverCallback) {
		this.callback = callback;
	}
	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();
	trigger(isIntersecting: boolean) {
		this.callback(
			[{ isIntersecting } as IntersectionObserverEntry],
			this as unknown as IntersectionObserver
		);
	}
}

let latestObserver: MockIntersectionObserver | null = null;

beforeEach(() => {
	mockNavigate.mockReset();
	mockReset.mockReset();
	mockSetQuery.mockReset();
	mockLoadMore.mockReset();
	mockSearchState = {
		query: '',
		setQuery: mockSetQuery,
		debouncedQuery: '',
		selectedTypes: [],
		setSelectedTypes: vi.fn(),
		toggleEntityType: vi.fn(),
		hits: [],
		hasMore: false,
		nextOffset: 0,
		searchAvailable: true,
		message: null,
		status: 'idle',
		loadMore: mockLoadMore,
		reset: mockReset,
	};
	latestObserver = null;
	vi.stubGlobal(
		'IntersectionObserver',
		vi.fn(function (this: MockIntersectionObserver, cb: IntersectionObserverCallback) {
			latestObserver = new MockIntersectionObserver(cb);
			return latestObserver;
		})
	);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

function expandSearch() {
	const toggle = screen.getByRole('button', { name: 'Search platform' });
	fireEvent.click(toggle);
}

describe('GlobalSearchAutocomplete (GSH1-T-U01…U14)', () => {
	it('GSH1-T-U01: magnifier click expands input with aria-expanded=true', () => {
		render(<GlobalSearchAutocomplete />);
		const toggle = screen.getByRole('button', { name: 'Search platform' });
		expect(toggle).toHaveAttribute('aria-expanded', 'false');
		fireEvent.click(toggle);
		expect(toggle).toHaveAttribute('aria-expanded', 'true');
		expect(screen.getByTestId('global-search-input')).toBeTruthy();
	});

	it('GSH1-T-U02: Escape collapses and clears query', () => {
		render(<GlobalSearchAutocomplete />);
		expandSearch();
		const input = screen.getByTestId('global-search-input');
		fireEvent.keyDown(input, { key: 'Escape' });
		expect(mockReset).toHaveBeenCalled();
		expect(screen.queryByTestId('global-search-input')).toBeNull();
	});

	it('GSH1-T-U07: keyboard ArrowDown + Enter navigates highlighted row', () => {
		mockSearchState = {
			...mockSearchState,
			query: 'demo',
			debouncedQuery: 'demo',
			status: 'ready',
			hits: [
				{
					entityType: 'user',
					entityId: 'u1',
					title: 'demo@example.com',
					routeParams: { type: 'user', ids: { userId: 'u1' } },
				},
			],
		};

		render(<GlobalSearchAutocomplete />);
		expandSearch();
		const input = screen.getByTestId('global-search-input');
		fireEvent.keyDown(input, { key: 'ArrowDown' });
		fireEvent.keyDown(input, { key: 'Enter' });
		expect(mockNavigate).toHaveBeenCalledWith('/en/users/u1');
		expect(mockReset).toHaveBeenCalled();
	});

	it('GSH1-T-U08: searchAvailable false shows inline message', () => {
		mockSearchState = {
			...mockSearchState,
			query: 'demo',
			debouncedQuery: 'demo',
			searchAvailable: false,
			message: 'Worker down',
			status: 'ready',
			hits: [],
		};

		render(<GlobalSearchAutocomplete />);
		expandSearch();
		expect(screen.getByText(/Search is unavailable/)).toBeTruthy();
		expect(screen.getByText(/Worker down/)).toBeTruthy();
	});

	it('GSH1-T-U09: mobile narrow viewport keeps combobox in document', () => {
		Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 360 });
		render(<GlobalSearchAutocomplete />);
		expandSearch();
		const root = screen.getByTestId('global-search');
		expect(root.className).toContain('global-search');
		expect(screen.getByRole('combobox')).toBeTruthy();
	});

	it('GSH1-T-U10: i18n placeholder renders', () => {
		render(<GlobalSearchAutocomplete />);
		expandSearch();
		expect(screen.getByPlaceholderText('Search platform…')).toBeTruthy();
	});

	it('GSH1-T-U11: XSS highlight payload renders safe text only', () => {
		mockSearchState = {
			...mockSearchState,
			query: 'xx',
			debouncedQuery: 'xx',
			status: 'ready',
			hits: [
				{
					entityType: 'user',
					entityId: 'u1',
					title: 'safe',
					highlights: ['<script>alert(1)</script><em>x</em>'],
					routeParams: { type: 'user', ids: { userId: 'u1' } },
				},
			],
		};

		const { container } = render(<GlobalSearchAutocomplete />);
		expandSearch();
		expect(container.querySelector('script')).toBeNull();
		expect(container.querySelector('em')?.textContent).toBe('x');
	});

	it('GSH1-T-U06: missing faceId disables scoped row', () => {
		mockSearchState = {
			...mockSearchState,
			query: 'room',
			debouncedQuery: 'room',
			status: 'ready',
			hits: [
				{
					entityType: 'face_chat_room',
					entityId: 'cr1',
					title: 'Lobby',
					routeParams: { type: 'face_chat_room', ids: { roomId: 'cr1' } },
				},
			],
		};

		render(<GlobalSearchAutocomplete />);
		expandSearch();
		const option = screen.getByRole('option');
		expect(option).toBeDisabled();
	});

	it('GSH1-T-U12: scroll sentinel triggers loadMore when hasMore=true', async () => {
		mockSearchState = {
			...mockSearchState,
			query: 'demo',
			debouncedQuery: 'demo',
			status: 'ready',
			hasMore: true,
			hits: [
				{
					entityType: 'user',
					entityId: 'u1',
					title: 'demo',
					routeParams: { type: 'user', ids: { userId: 'u1' } },
				},
			],
		};

		render(<GlobalSearchAutocomplete />);
		expandSearch();

		await waitFor(() => {
			expect(latestObserver).not.toBeNull();
		});

		latestObserver?.trigger(true);
		expect(mockLoadMore).toHaveBeenCalled();
	});

	it('GSH1-T-U14: hasMore=false does not call loadMore from observer', () => {
		mockSearchState = {
			...mockSearchState,
			query: 'demo',
			debouncedQuery: 'demo',
			status: 'ready',
			hasMore: false,
			hits: [
				{
					entityType: 'user',
					entityId: 'u1',
					title: 'demo',
					routeParams: { type: 'user', ids: { userId: 'u1' } },
				},
			],
		};

		render(<GlobalSearchAutocomplete />);
		expandSearch();

		expect(latestObserver).toBeNull();
		expect(mockLoadMore).not.toHaveBeenCalled();
	});
});
