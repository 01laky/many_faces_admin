import { describe, expect, it } from 'vitest';
import { collectEnvValidationErrors, DEMO_OAUTH2_CLIENT_SECRET, type EnvConfig } from '../env';

function baseCfg(overrides: Partial<EnvConfig> = {}): EnvConfig {
	return {
		apiUrl: 'https://api.example.com',
		defaultFacePrefix: 'admin',
		oauth2ClientId: 'client',
		oauth2ClientSecret: 'secret-prod',
		seqUrl: 'http://localhost:5342',
		enableSeqLogging: true,
		appName: 'Admin',
		appVersion: '1.0.0',
		environment: 'production',
		debugMode: false,
		...overrides,
	};
}

describe('env validation (ASH1-T-E01…E03)', () => {
	it('ASH1-T-E01: prod + http apiUrl fails', () => {
		const errors = collectEnvValidationErrors(baseCfg({ apiUrl: 'http://api.example.com' }), {
			production: true,
		});
		expect(errors.some((e) => e.includes('HTTPS'))).toBe(true);
	});

	it('ASH1-T-E02: missing oauth client id fails', () => {
		const errors = collectEnvValidationErrors(baseCfg({ oauth2ClientId: '' }));
		expect(errors.some((e) => e.includes('OAUTH2_CLIENT_ID'))).toBe(true);
	});

	it('ASH1-T-E03: demo secret fails in prod', () => {
		const errors = collectEnvValidationErrors(
			baseCfg({ oauth2ClientSecret: DEMO_OAUTH2_CLIENT_SECRET }),
			{ production: true }
		);
		expect(errors.some((e) => e.includes('demo'))).toBe(true);
	});

	it('ASH1-T-B06: empty defaultFacePrefix fails', () => {
		const errors = collectEnvValidationErrors(baseCfg({ defaultFacePrefix: '  ' }));
		expect(errors.some((e) => e.includes('FACE_PREFIX'))).toBe(true);
	});
});
