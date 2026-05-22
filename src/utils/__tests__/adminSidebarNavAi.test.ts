import { describe, expect, it } from 'vitest';
import { filterAdminSidebarNavItemsForAiSystem } from '../adminSidebarNavAi';

const BASE = [
	{ path: '/dashboard', labelKey: 'a', icon: '1' },
	{ path: '/chat', labelKey: 'b', icon: '2' },
	{ path: '/settings', labelKey: 'c', icon: '3' },
] as const;

describe('filterAdminSidebarNavItemsForAiSystem', () => {
	it('omits operator AI chat route when globally disabled', () => {
		const out = filterAdminSidebarNavItemsForAiSystem(BASE as unknown as typeof BASE, false);
		expect(out.map((i) => i.path)).toEqual(['/dashboard', '/settings']);
	});

	it('keeps navigation unchanged when globally enabled', () => {
		const out = filterAdminSidebarNavItemsForAiSystem(BASE as unknown as typeof BASE, true);
		expect(out).toHaveLength(BASE.length);
	});
});
