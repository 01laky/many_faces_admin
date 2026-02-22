import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './radix/Button';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import './Header.scss';

export function Header() {
	const getLocalizedPath = useLocalizedLink();
	const navigate = useNavigate();
	const { isAuthenticated, user, logout } = useAuth();

	const handleLogout = async () => {
		try {
			await logout();
			// Wait a bit for toast to show, then navigate
			setTimeout(() => {
				navigate(getLocalizedPath('/login'), { replace: true });
			}, 100);
		} catch {
			// Even if logout fails, navigate to login
			setTimeout(() => {
				navigate(getLocalizedPath('/login'), { replace: true });
			}, 100);
		}
	};

	return (
		<header className="app-header">
			<div className="header-container">
				<div className="header-right">
					<LanguageSwitcher />
					{isAuthenticated && user && (
						<div className="header-user">
							<span className="header-user-email">{user.email}</span>
							<Button variant="outline" onClick={handleLogout} className="header-logout">
								Logout
							</Button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
