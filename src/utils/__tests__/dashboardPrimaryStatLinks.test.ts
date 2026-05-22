import { describe, expect, it } from 'vitest';
import { shouldDashboardPrimaryStatLink } from '../dashboardPrimaryStatLinks';

describe('dashboardPrimaryStatLinks', () => {
	it('blocks message KPI link to /chat when AI is off', () => {
		expect(shouldDashboardPrimaryStatLink(false, { link: '/chat' })).toBe(false);
	});

	it('allows other dashboard cards when AI is off', () => {
		expect(shouldDashboardPrimaryStatLink(false, { link: '/faces' })).toBe(true);
	});

	it('allows /chat KPI when AI is on', () => {
		expect(shouldDashboardPrimaryStatLink(true, { link: '/chat' })).toBe(true);
	});
});
