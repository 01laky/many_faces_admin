/**
 * ESLint flat config for the **admin** Vite/React SPA (mirrors fe_demo layout: ignore generated `src/api`,
 * Yarn SDK/PnP artifacts, keep Prettier last). TanStack Table / RHF suppressions live next to call sites.
 */
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
	globalIgnores(['dist', 'node_modules', '.yarn/**/*', '.pnp.*']),
	{
		files: ['**/*.{ts,tsx}'],
		ignores: ['src/api/**/*', '.yarn/**/*', '.pnp.*'], // Ignore generated API files, Yarn SDKs, and PnP files
		extends: [
			js.configs.recommended,
			...tseslint.configs.recommended,
			reactRefresh.configs.vite,
			reactHooks.configs.flat.recommended,
			prettier, // Must be last to override other configs
		],
		plugins: {
			'react-hooks': reactHooks,
		},
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		rules: {
			// Allow unused vars that start with underscore
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			// Semicolons are handled by Prettier
		},
	},
	{
		// Context files can export hooks alongside components
		files: ['src/contexts/**/*.{ts,tsx}'],
		rules: {
			'react-refresh/only-export-components': 'off',
		},
	},
]);
