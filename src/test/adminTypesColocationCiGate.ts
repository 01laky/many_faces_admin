/**
 * Vitest types-colocation gate — keep aligned with `scripts/verify-admin-types-colocation-tests.mjs`.
 */
export const ADMIN_TYPES_COLOCATION_TEST_FILES = [
	'src/pages/ContentModerationPage/moderationFiltersConstants.colocation.edge.test.ts',
	'src/pages/SettingsPage/settingsConstants.colocation.edge.test.ts',
	'src/hooks/api/useUsersApi/usersApiTypes.colocation.edge.test.ts',
	'src/contexts/contextTypes.colocation.edge.test.ts',
	'src/providers/QueryProvider/queryProviderTypes.colocation.edge.test.ts',
	'src/components/radix/Button/buttonTypes.colocation.edge.test.ts',
	'src/components/tables/StoriesTable/storiesTableTypes.colocation.edge.test.ts',
	'src/components/dashboard/DashboardMetricsTable/dashboardMetricsConstants.colocation.edge.test.ts',
	'src/test/adminTypesColocationCiGate.colocation.edge.test.ts',
] as const;

export const ADMIN_TYPES_COLOCATION_TEST_GLOB = 'src/**/*.colocation.edge.test.ts';
