import { describe, it, expect } from 'vitest';
import { shouldShowOperatorManagementCard } from '../faceVideoLoungeDetailUi';

describe('faceVideoLoungeDetailUi', () => {
	// VL-AD-01: kick / stealth UI hidden for non-operator (no CanManageAllFaces).
	it('VL-AD-01_shouldHideOperatorManagement_whenNotOperator', () => {
		expect(shouldShowOperatorManagementCard(false)).toBe(false);
	});

	it('VL-AD-01_shouldShowOperatorManagement_whenOperator', () => {
		expect(shouldShowOperatorManagementCard(true)).toBe(true);
	});
});
