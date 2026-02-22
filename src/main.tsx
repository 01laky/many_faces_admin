import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'react-toastify/dist/ReactToastify.css';
import './styles/main.scss';
import './i18n/config'; // Initialize i18n
import { configureApiClient } from './api/config'; // Configure API client
import { setupAxiosInterceptors } from './api/interceptors'; // 401 auto-refresh / logout
import { validateEnv, logEnvConfig, env } from './config/env'; // Environment configuration
import { logger } from './utils/logger'; // Initialize logger
import { QueryProvider } from './providers/QueryProvider';
import App from './App.tsx';

// Validate and log environment configuration
validateEnv();
logEnvConfig();

// Configure API client on app startup
configureApiClient();

// Set up axios interceptors (auto-refresh token on 401, force logout on failure)
setupAxiosInterceptors();

// Log application startup
logger.info('Frontend application started', {
	AppName: env.appName,
	AppVersion: env.appVersion,
	Environment: env.environment,
});

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryProvider>
			<App />
		</QueryProvider>
	</StrictMode>
);
