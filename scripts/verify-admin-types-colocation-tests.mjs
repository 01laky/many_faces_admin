#!/usr/bin/env node
/**
 * CI helper: run required admin types/enums/constants colocation regression tests.
 *
 * Usage from many_faces_admin root:
 *   node scripts/verify-admin-types-colocation-tests.mjs
 *
 * File list must stay aligned with:
 *   src/test/adminTypesColocationCiGate.ts
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const admin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const gatePath = path.join(admin, 'src/test/adminTypesColocationCiGate.ts');
const gateSource = readFileSync(gatePath, 'utf8');

const listed = [...gateSource.matchAll(/'([^']+\.colocation\.edge\.test\.[^']+)'/g)].map((m) => m[1]);

if (listed.length === 0) {
	console.error('No colocation edge test paths found in adminTypesColocationCiGate.ts');
	process.exit(1);
}

const result = spawnSync('yarn', ['vitest', 'run', ...listed], {
	cwd: admin,
	stdio: 'inherit',
});

process.exit(result.status ?? 1);
