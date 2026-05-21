/** Human-readable byte size (1024-based). */
export function formatBytes(value?: number): string {
	if (value == null || !Number.isFinite(value)) return '—';
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	let size = value;
	let unit = 0;
	while (size >= 1024 && unit < units.length - 1) {
		size /= 1024;
		unit += 1;
	}
	return `${size.toFixed(size >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}
