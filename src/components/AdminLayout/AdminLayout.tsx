/**
 * AdminLayout.tsx - Responsive layout wrapper for authenticated admin pages
 *
 * Provides:
 * - Top header with hamburger menu (mobile/tablet), user avatar menu (settings, logout)
 * - Left sidebar navigation (collapsible on desktop, overlay drawer on mobile/tablet)
 * - Main content area that adapts to sidebar state
 * - Responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
 */

import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { isSuperAdminFromToken } from '@/utils/platformAccess';
import { useOperatorUserChatConversations } from '@/hooks/api/useOperatorUserChatApi';
import { useAdminMeProfile } from '@/hooks/api/useAdminMeProfileApi';
import { useOperatorAiSystemSettings } from '@/hooks/api/useOperatorAiApi';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { filterAdminSidebarNavItemsForAiSystem } from '@/utils/adminSidebarNavAi';
import { AppBrandTitle } from '@/components/AppBrandTitle/AppBrandTitle';
import { GlobalSearchAutocomplete } from '@/components/GlobalSearch';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import './AdminLayout.scss';

interface NavItem {
	path: string;
	labelKey: string;
	icon: string;
}

const NAV_ITEMS: NavItem[] = [
	{ path: '/dashboard', labelKey: 'pages.dashboard.title', icon: '📊' },
	{ path: '/users', labelKey: 'pages.users.title', icon: '👥' },
	{ path: '/faces', labelKey: 'pages.faces.title', icon: '😀' },
	{ path: '/chat', labelKey: 'pages.chat.title', icon: '💬' },
];

const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
	{ path: '/moderation', labelKey: 'pages.moderation.title', icon: '🛡' },
	{ path: '/user-chat', labelKey: 'pages.userChat.title', icon: '📩' },
];

const SETTINGS_NAV_ITEM: NavItem = {
	path: '/settings',
	labelKey: 'pages.settings.title',
	icon: '⚙️',
};

const ADMIN_PROFILE_NAV_ITEM: NavItem = {
	path: '/profile',
	labelKey: 'pages.adminProfile.title',
	icon: '👤',
};

const DESKTOP_BREAKPOINT = 1024;

interface AdminLayoutProps {
	children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
	const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= DESKTOP_BREAKPOINT);
	const [isMobile, setIsMobile] = useState(() => window.innerWidth < DESKTOP_BREAKPOINT);
	const location = useLocation();
	const navigate = useNavigate();
	const { t } = useTranslation('common');
	const { user, logout, token, isAuthenticated } = useAuth();
	const getLocalizedPath = useLocalizedLink();
	const { confirm, ConfirmModalHost } = useConfirmModal();
	const reduceMotion = useReducedMotion();
	const isSuperAdmin = isSuperAdminFromToken(token);
	const { data: userChatConversations = [] } = useOperatorUserChatConversations();
	const { data: operatorAiSystemSettings } = useOperatorAiSystemSettings();
	const operatorAiGloballyEnabled = operatorAiSystemSettings?.aiEnabled === true;
	const userChatUnread = isSuperAdmin
		? userChatConversations.reduce((sum, c) => sum + c.unreadCount, 0)
		: 0;

	const baseNavItems = isSuperAdmin
		? [...NAV_ITEMS, ...SUPER_ADMIN_NAV_ITEMS, ADMIN_PROFILE_NAV_ITEM, SETTINGS_NAV_ITEM]
		: [...NAV_ITEMS, ADMIN_PROFILE_NAV_ITEM, SETTINGS_NAV_ITEM];
	const navItems = filterAdminSidebarNavItemsForAiSystem(baseNavItems, operatorAiGloballyEnabled);

	// Detect screen size
	const handleResize = useCallback(() => {
		const mobile = window.innerWidth < DESKTOP_BREAKPOINT;
		setIsMobile(mobile);
		if (mobile) {
			setSidebarOpen(false);
		}
	}, []);

	useEffect(() => {
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [handleResize]);

	// Close sidebar on navigation (mobile/tablet) — state adjustment during render
	const [prevPathname, setPrevPathname] = useState(location.pathname);
	if (location.pathname !== prevPathname) {
		setPrevPathname(location.pathname);
		if (isMobile) {
			setSidebarOpen(false);
		}
	}

	const toggleSidebar = () => setSidebarOpen((prev) => !prev);

	const handleLogout = async () => {
		try {
			await logout();
			setTimeout(() => navigate(getLocalizedPath('/login'), { replace: true }), 100);
		} catch {
			setTimeout(() => navigate(getLocalizedPath('/login'), { replace: true }), 100);
		}
	};

	const { data: meProfile } = useAdminMeProfile(isAuthenticated);

	const goToProfile = () => {
		navigate(getLocalizedPath('/profile'));
	};

	const goToSettings = () => {
		navigate(getLocalizedPath('/settings'));
	};

	const requestLogout = async () => {
		const confirmed = await confirm({
			title: t('pages.logout.title'),
			message: t('pages.logout.confirmMessage'),
			confirmVariant: 'danger',
		});
		if (confirmed) {
			await handleLogout();
		}
	};

	const headerAvatarUrl = meProfile?.globalAvatarUrl ?? null;
	const headerAvatarInitial = (
		user?.firstName?.charAt(0) ||
		user?.email?.charAt(0) ||
		'?'
	).toUpperCase();
	const sidebarWidth = sidebarOpen && !isMobile ? 260 : 0;

	const renderAvatar = (className: string) =>
		headerAvatarUrl ? (
			<img src={headerAvatarUrl} alt="" className={className} />
		) : (
			<span className={className} aria-hidden>
				{headerAvatarInitial}
			</span>
		);

	return (
		<div className="admin-layout">
			{/* ==================== TOP HEADER ==================== */}
			<header className="admin-header" style={{ left: isMobile ? 0 : sidebarWidth }}>
				<div className="admin-header__left">
					<button
						className="admin-header__hamburger"
						onClick={toggleSidebar}
						aria-label={
							sidebarOpen
								? t('common.closeSidebar') || 'Close menu'
								: t('common.openSidebar') || 'Open menu'
						}
					>
						<span className={`hamburger-icon ${sidebarOpen ? 'open' : ''}`}>
							<span />
							<span />
							<span />
						</span>
					</button>
					<AppBrandTitle className="admin-header__title">Many Faces Admin</AppBrandTitle>
				</div>

				{isSuperAdmin && (
					<div className="admin-header__center">
						<GlobalSearchAutocomplete />
					</div>
				)}

				<div className="admin-header__right">
					{user && (
						<div className="admin-header__user">
							<DropdownMenu.Root>
								<DropdownMenu.Trigger asChild>
									<button
										type="button"
										className="admin-header__avatar-trigger"
										aria-label={t('common.userMenu', { defaultValue: 'User menu' })}
									>
										{renderAvatar('admin-header__avatar')}
									</button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Portal>
									<DropdownMenu.Content className="admin-header__menu" sideOffset={8} align="end">
										<DropdownMenu.Item className="admin-header__menu-item" onSelect={goToProfile}>
											{t('pages.adminProfile.title')}
										</DropdownMenu.Item>
										<DropdownMenu.Item className="admin-header__menu-item" onSelect={goToSettings}>
											{t('pages.settings.title') || 'Settings'}
										</DropdownMenu.Item>
										<DropdownMenu.Item
											className="admin-header__menu-item admin-header__menu-item--logout"
											onSelect={(event) => {
												event.preventDefault();
												void requestLogout();
											}}
										>
											{t('pages.logout.title') || 'Logout'}
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Portal>
							</DropdownMenu.Root>
						</div>
					)}
				</div>
			</header>

			{/* ==================== SIDEBAR ==================== */}
			{/* Overlay backdrop for mobile/tablet */}
			{reduceMotion ? (
				isMobile &&
				sidebarOpen && (
					<div
						className="admin-sidebar-overlay"
						style={{ opacity: 1 }}
						onClick={() => setSidebarOpen(false)}
					/>
				)
			) : (
				<AnimatePresence>
					{isMobile && sidebarOpen && (
						<motion.div
							className="admin-sidebar-overlay"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							onClick={() => setSidebarOpen(false)}
						/>
					)}
				</AnimatePresence>
			)}

			<aside
				className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : 'admin-sidebar--closed'} ${isMobile ? 'admin-sidebar--mobile' : 'admin-sidebar--desktop'}`}
			>
				<div className="admin-sidebar__header">
					<AppBrandTitle className="admin-sidebar__logo">Many Faces Admin</AppBrandTitle>
					{isMobile && (
						<button
							className="admin-sidebar__close"
							onClick={() => setSidebarOpen(false)}
							aria-label="Close menu"
						>
							✕
						</button>
					)}
				</div>

				<nav className="admin-sidebar__nav">
					{navItems.map((item) => {
						const localizedPath = getLocalizedPath(item.path);
						const isActive =
							location.pathname.includes(item.path) ||
							location.pathname.includes(localizedPath.split('/').pop() || '');
						return (
							<Link
								key={item.path}
								to={localizedPath}
								className={`admin-sidebar__item ${isActive ? 'admin-sidebar__item--active' : ''}`}
							>
								<span className="admin-sidebar__icon">{item.icon}</span>
								<span className="admin-sidebar__label">
									{t(item.labelKey)}
									{item.path === '/user-chat' && userChatUnread > 0 ? ` (${userChatUnread})` : ''}
								</span>
							</Link>
						);
					})}
				</nav>

				{user && (
					<div className="admin-sidebar__footer">
						<div className="admin-sidebar__user-card">
							{renderAvatar('admin-sidebar__user-avatar')}
							<div className="admin-sidebar__user-info">
								{user.firstName && user.lastName && (
									<div className="admin-sidebar__user-name">
										{user.firstName} {user.lastName}
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</aside>

			{/* ==================== MAIN CONTENT ==================== */}
			<main className="admin-main" style={{ marginLeft: isMobile ? 0 : sidebarWidth }}>
				{children}
			</main>

			{ConfirmModalHost}
		</div>
	);
}
