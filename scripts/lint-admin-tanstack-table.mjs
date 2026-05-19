import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const allowlistPath = path.join(root, 'scripts/lint-admin-tanstack-table-allowlist.txt');

function readAllowlist() {
	try {
		return readFileSync(allowlistPath, 'utf8')
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith('#'));
	} catch {
		return [];
	}
}

const allowlist = readAllowlist();

function isAllowed(filePath) {
	return allowlist.some((entry) => filePath.includes(entry));
}

const rawTable = execSync("grep -rn '<table' src/pages --include='*.tsx' || true", {
	cwd: root,
	encoding: 'utf8',
});

const bootstrapTable = execSync(
	"grep -rn \"Table\" src/pages --include='*.tsx' | grep react-bootstrap || true",
	{ cwd: root, encoding: 'utf8' }
);

const violations = [];

for (const line of rawTable.split('\n').filter(Boolean)) {
	const file = line.split(':')[0];
	if (!isAllowed(file)) violations.push(`raw <table>: ${line}`);
}

for (const line of bootstrapTable.split('\n').filter(Boolean)) {
	const file = line.split(':')[0];
	if (!isAllowed(file)) violations.push(`react-bootstrap Table: ${line}`);
}

if (violations.length > 0) {
	console.error('TanStack Table lint failed — migrate or allowlist:\n');
	for (const v of violations) console.error(v);
	process.exit(1);
}

console.log('lint-admin-tanstack-table: ok');
