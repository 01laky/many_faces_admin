/**
 * Validates `collectEnvValidationErrors` for admin defaults (different `defaultFacePrefix` / Seq defaults
 * than public fe_demo, but the same URL + OAuth required-field rules apply).
 */
import { describe, it, expect } from 'vitest';
import { collectEnvValidationErrors, type EnvConfig } from '../env';

const base = (): EnvConfig => ({
	apiUrl: 'https://api.example.com',
	defaultFacePrefix: 'admin',
	oauth2ClientId: 'id',
	oauth2ClientSecret: 'secret',
	seqUrl: 'https://seq.example.com',
	enableSeqLogging: false,
	appName: 'Admin',
	appVersion: '1',
	environment: 'test',
	debugMode: false,
});

describe('collectEnvValidationErrors', () => {
	it('accepts valid config', () => {
		expect(collectEnvValidationErrors(base())).toEqual([]);
	});

	it('flags invalid api URL', () => {
		const cfg = base();
		cfg.apiUrl = 'not a url';
		expect(collectEnvValidationErrors(cfg).some((m) => m.includes('VITE_API_URL'))).toBe(true);
	});

	it('flags empty oauth secret', () => {
		const cfg = base();
		cfg.oauth2ClientSecret = '';
		expect(collectEnvValidationErrors(cfg)).toContain('VITE_OAUTH2_CLIENT_SECRET is required');
	});
});
