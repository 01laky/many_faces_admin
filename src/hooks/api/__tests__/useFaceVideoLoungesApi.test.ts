import { describe, it, expect } from 'vitest';
import {
	operatorVideoLoungeStealthJoinPath,
	operatorVideoLoungeKickPath,
	operatorVideoLoungeKickAllPath,
} from '../useFaceVideoLoungesApi';

describe('useFaceVideoLoungesApi operator paths', () => {
	// VL-AD-02: stealth join must use operator-content prefix, not member live/join.
	it('VL-AD-02_stealthJoinUsesOperatorApi', () => {
		expect(operatorVideoLoungeStealthJoinPath(42)).toBe(
			'/api/operator-content/video-lounges/42/live/stealth-join'
		);
		expect(operatorVideoLoungeStealthJoinPath(42)).not.toContain('/api/faces/');
		expect(operatorVideoLoungeStealthJoinPath(42)).not.toContain('/live/join');
	});

	it('VL-AD-02_kickUsesOperatorApi', () => {
		expect(operatorVideoLoungeKickPath(7, 'user-1')).toBe(
			'/api/operator-content/video-lounges/7/live/kick/user-1'
		);
	});

	it('VL-AD-02_kickAllUsesOperatorApi', () => {
		expect(operatorVideoLoungeKickAllPath(9)).toBe(
			'/api/operator-content/video-lounges/9/live/kick-all'
		);
	});
});
