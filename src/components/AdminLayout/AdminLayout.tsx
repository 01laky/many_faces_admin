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
import { isSuperAdminFromToken } from '@/utils/contentModeration';
import { useOperatorUserChatConversations } from '@/hooks/api/useOperatorUserChatApi';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useConfirmModal } from '@/hooks/useConfirmModal';
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
	const { user, logout, token } = useAuth();
	const getLocalizedPath = useLocalizedLink();
	const { confirm, ConfirmModalHost } = useConfirmModal();
	const reduceMotion = useReducedMotion();
	const isSuperAdmin = isSuperAdminFromToken(token);
	const { data: userChatConversations = [] } = useOperatorUserChatConversations();
	const userChatUnread = isSuperAdmin
		? userChatConversations.reduce((sum, c) => sum + c.unreadCount, 0)
		: 0;

	const navItems = isSuperAdmin ? [...NAV_ITEMS, ...SUPER_ADMIN_NAV_ITEMS] : NAV_ITEMS;

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

	const sidebarWidth = sidebarOpen && !isMobile ? 260 : 0;

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
					<span className="admin-header__title">Many Faces Admin</span>
				</div>

				<div className="admin-header__right">
					<LanguageSwitcher />
					{user && (
						<div className="admin-header__user">
							<DropdownMenu.Root>
								<DropdownMenu.Trigger asChild>
									<button
										type="button"
										className="admin-header__avatar-trigger"
										aria-label={t('common.userMenu', { defaultValue: 'User menu' })}
									>
										<span className="admin-header__avatar" aria-hidden>
											{user.email.charAt(0).toUpperCase()}
										</span>
									</button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Portal>
									<DropdownMenu.Content className="admin-header__menu" sideOffset={8} align="end">
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
							<span className="admin-header__email">{user.email}</span>
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
					<span className="admin-sidebar__logo">Many Faces Admin</span>
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
							<div className="admin-sidebar__user-avatar">{user.email.charAt(0).toUpperCase()}</div>
							<div className="admin-sidebar__user-info">
								<div className="admin-sidebar__user-email">{user.email}</div>
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
