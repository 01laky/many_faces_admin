/**
 * Admin SPA bridge over Vite `import.meta.env`. Mirrors `fe_demo/src/config/env.ts` shape so the same
 * validation helpers (`collectEnvValidationErrors`) can be reused, but defaults differ:
 * - **`defaultFacePrefix`** is typically `admin` so API traffic is namespaced under `/admin/api/...`.
 * - **`seqUrl`** defaults to an absolute Seq URL (admin demo enables Seq logging by default); there is
 *   no hard-coded `/seq-proxy` branch here — add one if this SPA should match the public app’s dev proxy.
 */

/** Typed view of supported `VITE_*` keys after defaults merge. */
export interface EnvConfig {
	/** REST base URL consumed by OpenAPI-generated clients. */
	apiUrl: string;
	/** URL segment before `/api/...` for admin tenant routing (e.g. `admin` → `/admin/api/...`). */
	defaultFacePrefix: string;

	oauth2ClientId: string;
	oauth2ClientSecret: string;

	/** Absolute Seq endpoint when logging is enabled. */
	seqUrl: string;
	/** Master switch for forwarding logs to Seq in the admin bundle. */
	enableSeqLogging: boolean;

	appName: string;
	appVersion: string;
	environment: string;
	debugMode: boolean;
}

function getEnv(key: string, defaultValue: string): string {
	return import.meta.env[key] || defaultValue;
}

function getBoolEnv(key: string, defaultValue: boolean): boolean {
	const value = import.meta.env[key];
	if (value === undefined) return defaultValue;
	return value === 'true' || value === '1';
}

/* Reserved numeric env helper — keep commented until a `VITE_*` number knob ships.
function _getNumberEnv(key: string, defaultValue: number): number {
//   const value = import.meta.env[key];
//   if (value === undefined) return defaultValue;
//   const parsed = Number(value);
//   return isNaN(parsed) ? defaultValue : parsed;
}
*/

export const env: EnvConfig = {
	// API Configuration
	apiUrl: getEnv('VITE_API_URL', 'https://localhost:8001'),
	defaultFacePrefix: getEnv('VITE_DEFAULT_FACE_PREFIX', 'admin'),

	// OAuth2 Configuration
	oauth2ClientId: getEnv('VITE_OAUTH2_CLIENT_ID', 'be-demo-client'),
	oauth2ClientSecret: getEnv('VITE_OAUTH2_CLIENT_SECRET', 'be-demo-secret-very-strong-key'),

	// Seq Logging Configuration
	seqUrl: getEnv('VITE_SEQ_URL', 'http://localhost:5342'),
	enableSeqLogging: getBoolEnv('VITE_ENABLE_SEQ_LOGGING', true),

	// Application Configuration
	appName: getEnv('VITE_APP_NAME', 'Admin Demo'),
	appVersion: getEnv('VITE_APP_VERSION', '1.0.0'),
	environment: import.meta.env.MODE || 'development',

	// Development Configuration
	debugMode: getBoolEnv('VITE_DEBUG_MODE', false),
};

/** Same contract as fe_demo: pure validation list for tests + `validateEnv`. */
export function collectEnvValidationErrors(cfg: EnvConfig): string[] {
	const errors: string[] = [];

	try {
		new URL(cfg.apiUrl);
	} catch {
		errors.push(`Invalid VITE_API_URL: ${cfg.apiUrl}`);
	}

	if (cfg.enableSeqLogging) {
		try {
			new URL(cfg.seqUrl);
		} catch {
			errors.push(`Invalid VITE_SEQ_URL: ${cfg.seqUrl}`);
		}
	}

	if (!cfg.oauth2ClientId) {
		errors.push('VITE_OAUTH2_CLIENT_ID is required');
	}

	if (!cfg.oauth2ClientSecret) {
		errors.push('VITE_OAUTH2_CLIENT_SECRET is required');
	}

	return errors;
}

/** Logs configuration problems; throws in **production** builds only (mirrors fe_demo behavior). */
export function validateEnv(): void {
	const errors = collectEnvValidationErrors(env);

	if (errors.length > 0) {
		console.error('❌ Environment configuration errors:');
		errors.forEach((error) => console.error(`   - ${error}`));
		if (import.meta.env.PROD) {
			throw new Error('Invalid environment configuration');
		}
	}
}

/** Dev-only diagnostics when `debugMode` is enabled. */
export function logEnvConfig(): void {
	if (import.meta.env.DEV && env.debugMode) {
		console.log('🔧 Environment Configuration:');
		console.log(`   API URL: ${env.apiUrl}`);
		console.log(`   Seq URL: ${env.seqUrl}`);
		console.log(`   Seq Logging: ${env.enableSeqLogging ? 'enabled' : 'disabled'}`);
		console.log(`   OAuth2 Client ID: ${env.oauth2ClientId}`);
		console.log(`   App Name: ${env.appName}`);
		console.log(`   App Version: ${env.appVersion}`);
		console.log(`   Environment: ${env.environment}`);
		console.log(`   Debug Mode: ${env.debugMode ? 'enabled' : 'disabled'}`);
	}
}
