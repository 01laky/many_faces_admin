import { execSync } from 'node:child_process';

const out = execSync("grep -r \"from '@/api/services/\" src/pages --include='*.tsx' || true", {
	encoding: 'utf8',
});
if (out.trim()) {
	console.error('Pages must not import @/api/services/* (use hooks/api instead):\n');
	console.error(out);
	process.exit(1);
}
