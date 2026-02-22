/**
 * AdminLayout.tsx - Responsive layout wrapper for authenticated admin pages
 *
 * Provides:
 * - Top header with hamburger menu (mobile/tablet), user info, logout
 * - Left sidebar navigation (collapsible on desktop, overlay drawer on mobile/tablet)
 * - Main content area that adapts to sidebar state
 * - Responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
 */

import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AnimatePresence, motion } from 'framer-motion';
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
	const { user, logout } = useAuth();
	const getLocalizedPath = useLocalizedLink();

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
					<span className="admin-header__title">Admin Demo</span>
				</div>

				<div className="admin-header__right">
					<LanguageSwitcher />
					{user && (
						<div className="admin-header__user">
							<div className="admin-header__avatar">{user.email.charAt(0).toUpperCase()}</div>
							<span className="admin-header__email">{user.email}</span>
							<button className="admin-header__logout" onClick={handleLogout}>
								{t('pages.logout.title') || 'Logout'}
							</button>
						</div>
					)}
				</div>
			</header>

			{/* ==================== SIDEBAR ==================== */}
			{/* Overlay backdrop for mobile/tablet */}
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

			<aside
				className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : 'admin-sidebar--closed'} ${isMobile ? 'admin-sidebar--mobile' : 'admin-sidebar--desktop'}`}
			>
				<div className="admin-sidebar__header">
					<span className="admin-sidebar__logo">Admin Demo</span>
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
					{NAV_ITEMS.map((item) => {
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
								<span className="admin-sidebar__label">{t(item.labelKey)}</span>
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
		</div>
	);
}
