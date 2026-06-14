/**
 * Admin SPA bridge over Vite `import.meta.env`. Mirrors `many_faces_portal/src/config/env.ts` shape so the same
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

/**
 * Host ports where the admin-demo-proxy nginx serves `/api` on the same origin (docker-compose
 * `admin-demo-proxy`: HTTP :8090 / HTTPS :8091). Port :8082 is deliberately excluded — that is the
 * direct Vite dev server (`admin-demo-dev`, `8082:8081`), which has **no** `/api` reverse proxy, so
 * a same-origin request there hits Vite and returns `index.html` (breaking `GET /api/localization/admin`
 * with a non-JSON body). Direct Vite on localhost falls through to `fromEnv` (VITE_API_URL → :8001);
 * direct Vite on a remote host is handled by the dedicated :8082 branch in `resolveApiUrl` below.
 */
const ADMIN_DEV_PROXY_PORTS = new Set(['8090', '8091']);

/**
 * Docker admin HTTP entry (host :8090 → nginx :80) mirrors portal :9080 — browser must not call
 * localhost:8001 on a remote PC. Same-origin → nginx → be-demo-dev:8000.
 */
export function resolveApiUrl(
	fromEnv: string,
	isDev: boolean,
	location?: Pick<Location, 'port' | 'origin' | 'hostname' | 'protocol'>
): string {
	if (!isDev || !location) return fromEnv;
	if (ADMIN_DEV_PROXY_PORTS.has(location.port)) {
		return location.origin;
	}
	const host = location.hostname;
	if (host !== 'localhost' && host !== '127.0.0.1' && location.port === '8082') {
		const scheme = location.protocol === 'http:' ? 'http' : 'https';
		const apiPort = scheme === 'http' ? '8000' : '8001';
		return `${scheme}://${host}:${apiPort}`;
	}
	return fromEnv;
}

/* Reserved numeric env helper — keep commented until a `VITE_*` number knob ships.
function _getNumberEnv(key: string, defaultValue: number): number {
//   const value = import.meta.env[key];
//   if (value === undefined) return defaultValue;
//   const parsed = Number(value);
//   return isNaN(parsed) ? defaultValue : parsed;
}
*/

const viteApiFallback = getEnv('VITE_API_URL', 'https://localhost:8001');

export const env: EnvConfig = {
	// API Configuration
	apiUrl:
		typeof window !== 'undefined'
			? resolveApiUrl(viteApiFallback, !!import.meta.env.DEV, window.location)
			: viteApiFallback,
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

/** Demo OAuth secret shipped in `.env.example` — must not be used in production builds (ASH1-A7). */
export const DEMO_OAUTH2_CLIENT_SECRET = 'be-demo-secret-very-strong-key';

export interface EnvValidationOptions {
	/** When true, enforce HTTPS API URL and non-demo OAuth secret. */
	production?: boolean;
}

/** Same contract as many_faces_portal: pure validation list for tests + `validateEnv`. */
export function collectEnvValidationErrors(
	cfg: EnvConfig,
	options: EnvValidationOptions = {}
): string[] {
	const errors: string[] = [];

	try {
		const api = new URL(cfg.apiUrl);
		if (options.production && api.protocol !== 'https:') {
			errors.push(`Production builds require HTTPS VITE_API_URL (got ${cfg.apiUrl})`);
		}
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

	if (options.production && cfg.oauth2ClientSecret === DEMO_OAUTH2_CLIENT_SECRET) {
		errors.push(
			'Production builds must not use the demo VITE_OAUTH2_CLIENT_SECRET — configure a deployment-specific value'
		);
	}

	if (!cfg.defaultFacePrefix?.trim()) {
		errors.push('VITE_DEFAULT_FACE_PREFIX is required');
	}

	return errors;
}

/** Logs configuration problems; throws in **production** builds only (mirrors many_faces_portal behavior). */
export function validateEnv(): void {
	const errors = collectEnvValidationErrors(env, { production: import.meta.env.PROD });

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
