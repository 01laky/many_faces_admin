import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
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

function collectTableFiles(dir, acc = []) {
	for (const name of readdirSync(dir)) {
		const full = path.join(dir, name);
		if (statSync(full).isDirectory()) {
			collectTableFiles(full, acc);
		} else if (/Table\.tsx$/.test(name) || name === 'ModerationQueueTable.tsx') {
			acc.push(full);
		}
	}
	return acc;
}

const rawTable = execSync("grep -rn '<table' src/pages --include='*.tsx' || true", {
	cwd: root,
	encoding: 'utf8',
});

const bootstrapTable = execSync(
	'grep -rn "Table" src/pages --include=\'*.tsx\' | grep react-bootstrap || true',
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

/** §4.8 — server-driven TanStack tables must not mix client row models with manual* flags. */
const SERVER_LIST_HOOKS = /\buse(Users|Faces|Pages)\b/;
const tableFiles = [
	...collectTableFiles(path.join(root, 'src/components/tables')),
	...collectTableFiles(path.join(root, 'src/pages')),
].filter((f) => !isAllowed(f));

for (const absPath of tableFiles) {
	const rel = path.relative(root, absPath);
	const content = readFileSync(absPath, 'utf8');

	if (/manualSorting:\s*true/.test(content) && /\bgetSortedRowModel\b/.test(content)) {
		violations.push(
			`${rel}: manualSorting:true with getSortedRowModel (use server sortBy/sortDir only)`
		);
	}

	if (/manualPagination:\s*true/.test(content) && /\bgetPaginationRowModel\b/.test(content)) {
		violations.push(
			`${rel}: manualPagination:true with getPaginationRowModel (use server page envelope)`
		);
	}

	if (SERVER_LIST_HOOKS.test(content) && !/manualPagination:\s*true/.test(content)) {
		// Server manual* flags live in FaceDetailEntityTableShell (shared chrome).
		if (/FaceDetailEntityTableShell/.test(content)) continue;
		violations.push(`${rel}: list hook (useUsers/useFaces/usePages) without manualPagination:true`);
	}
}

if (violations.length > 0) {
	console.error('TanStack Table lint failed — migrate or allowlist:\n');
	for (const v of violations) console.error(v);
	process.exit(1);
}

console.log('lint-admin-tanstack-table: ok');
