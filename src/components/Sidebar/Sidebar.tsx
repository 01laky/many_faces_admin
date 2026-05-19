import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { useAuth } from '@/contexts/AuthContext';
import { isSuperAdminFromToken } from '@/utils/contentModeration';
import './Sidebar.scss';

interface NavItem {
	path: string;
	labelKey: string;
	icon?: string;
}

export function Sidebar() {
	const [isOpen, setIsOpen] = useState(true);
	const location = useLocation();
	const { t } = useTranslation('common');
	const getLocalizedPath = useLocalizedLink();
	const { user, token } = useAuth();

	const navItems: NavItem[] = [
		{
			path: '/homepage',
			labelKey: 'pages.homepage.title',
			icon: '🏠',
		},
		{
			path: '/users',
			labelKey: 'pages.users.title',
			icon: '👥',
		},
		{
			path: '/faces',
			labelKey: 'pages.faces.title',
			icon: '😀',
		},
		...(isSuperAdminFromToken(token)
			? [
					{
						path: '/moderation',
						labelKey: 'pages.moderation.title',
						icon: '🛡',
					},
				]
			: []),
		{
			path: '/chat',
			labelKey: 'pages.chat.title',
			icon: '💬',
		},
		{
			path: '/settings',
			labelKey: 'pages.settings.title',
			icon: '⚙️',
		},
	];

	const sidebarVariants = {
		open: {
			width: 250,
			transition: {
				type: 'spring',
				stiffness: 300,
				damping: 30,
			},
		},
		closed: {
			width: 70,
			transition: {
				type: 'spring',
				stiffness: 300,
				damping: 30,
			},
		},
	};

	// Update CSS variable when sidebar state changes
	useEffect(() => {
		const root = document.documentElement;
		root.style.setProperty('--sidebar-width', isOpen ? '250px' : '70px');
	}, [isOpen]);

	const itemVariants = {
		open: {
			opacity: 1,
			x: 0,
			transition: {
				type: 'spring',
				stiffness: 300,
				damping: 30,
			},
		},
		closed: {
			opacity: 0,
			x: -20,
			transition: {
				type: 'spring',
				stiffness: 300,
				damping: 30,
			},
		},
	};

	return (
		<motion.div
			className="sidebar"
			variants={sidebarVariants}
			initial={false}
			animate={isOpen ? 'open' : 'closed'}
		>
			<div className="sidebar-header">
				<motion.button
					className="sidebar-toggle"
					onClick={() => setIsOpen(!isOpen)}
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
				>
					<motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
						{isOpen ? '←' : '→'}
					</motion.span>
				</motion.button>
				<AnimatePresence>
					{isOpen && (
						<motion.div
							className="sidebar-logo"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.2 }}
						>
							Many Faces Admin
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<nav className="sidebar-nav">
				{navItems.map((item) => {
					const isActive = location.pathname.includes(item.path);
					return (
						<motion.div
							key={item.path}
							variants={itemVariants}
							whileHover={{ scale: 1.05, x: 5 }}
							whileTap={{ scale: 0.95 }}
						>
							<Link
								to={getLocalizedPath(item.path)}
								className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
							>
								{item.icon && <span className="sidebar-nav-icon">{item.icon}</span>}
								<AnimatePresence>
									{isOpen && (
										<motion.span
											className="sidebar-nav-label"
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -10 }}
											transition={{ duration: 0.2 }}
										>
											{t(item.labelKey)}
										</motion.span>
									)}
								</AnimatePresence>
							</Link>
						</motion.div>
					);
				})}
			</nav>

			<AnimatePresence>
				{isOpen && user && (
					<motion.div
						className="sidebar-footer"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.3 }}
					>
						<div className="sidebar-user">
							<div className="sidebar-user-avatar">{user.email.charAt(0).toUpperCase()}</div>
							<div className="sidebar-user-info">
								<div className="sidebar-user-email">{user.email}</div>
								{user.firstName && user.lastName && (
									<div className="sidebar-user-name">
										{user.firstName} {user.lastName}
									</div>
								)}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
