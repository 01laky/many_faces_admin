// @vitest-environment happy-dom
import { describe, expect, it, vi, beforeEach, beforeAll } from 'vitest';
import type { ReactNode, HTMLAttributes } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';

const mockUser = {
	id: 'u-self',
	email: 'super.secret@never-show.com',
	firstName: 'Super',
	lastName: 'Admin',
};

let mockGlobalAvatarUrl: string | null = null;

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: () => ({
		user: mockUser,
		logout: vi.fn(),
		token: 'eyJ.test',
		isAuthenticated: true,
	}),
}));

vi.mock('@/hooks/useLocalizedLink', () => ({
	useLocalizedLink: () => (path: string) => `/en${path.startsWith('/') ? path : `/${path}`}`,
}));

vi.mock('@/utils/platformAccess', () => ({
	isSuperAdminFromToken: () => true,
}));

vi.mock('@/hooks/api/useOperatorUserChatApi', () => ({
	useOperatorUserChatConversations: () => ({ data: [] }),
}));

vi.mock('@/hooks/api/useAdminMeProfileApi', () => ({
	useAdminMeProfile: () => ({ data: { globalAvatarUrl: mockGlobalAvatarUrl } }),
}));

vi.mock('@/hooks/api/useOperatorAiApi', () => ({
	useOperatorAiSystemSettings: () => ({ data: { aiEnabled: false } }),
}));

vi.mock('@/hooks/useConfirmModal', () => ({
	useConfirmModal: () => ({ confirm: vi.fn(), ConfirmModalHost: null }),
}));

vi.mock('@/components/GlobalSearch', () => ({
	GlobalSearchAutocomplete: () => <div data-testid="global-search" />,
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => {
			const labels: Record<string, string> = {
				'pages.dashboard.title': 'Dashboard',
				'pages.users.title': 'Users',
				'pages.faces.title': 'Faces',
				'pages.chat.title': 'Chat',
				'pages.moderation.title': 'Moderation',
				'pages.userChat.title': 'User chat',
				'pages.adminProfile.title': 'Admin profile',
				'pages.settings.title': 'Settings',
				'pages.logout.title': 'Logout',
				'common.closeSidebar': 'Close menu',
				'common.openSidebar': 'Open menu',
				'common.userMenu': 'User menu',
			};
			return labels[key] ?? key;
		},
	}),
}));

vi.mock('framer-motion', () => ({
	AnimatePresence: ({ children }: { children: ReactNode }) => children,
	motion: {
		div: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
			<div {...props}>{children}</div>
		),
	},
	useReducedMotion: () => true,
}));

function renderLayout() {
	return render(
		<MemoryRouter initialEntries={['/en/dashboard']}>
			<AdminLayout>
				<div>content</div>
			</AdminLayout>
		</MemoryRouter>
	);
}

beforeAll(() => {
	Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1280 });
});

describe('SAP-U6 AdminLayout hides operator email in chrome', () => {
	beforeEach(() => {
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: 1280,
		});
	});

	it('does not render email text in header or sidebar footer', () => {
		const { container } = renderLayout();
		expect(container.textContent).not.toContain(mockUser.email);
		expect(screen.queryByText(mockUser.email)).toBeNull();
	});
});

describe('SAP-U9 header avatar from profile query', () => {
	beforeEach(() => {
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: 1280,
		});
	});

	it('renders avatar image when globalAvatarUrl is present', () => {
		mockGlobalAvatarUrl = 'https://cdn.example/avatar.png';
		renderLayout();
		const img = document.querySelector('.admin-header__avatar') as HTMLImageElement | null;
		expect(img?.tagName).toBe('IMG');
		expect(img?.src).toContain('avatar.png');
	});
});
