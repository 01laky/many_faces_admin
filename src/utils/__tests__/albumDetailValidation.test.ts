import { describe, it, expect } from 'vitest';
import {
	validateReasonAndUserMessage,
	shouldSyncUserMessageFromReason,
	nextSyncedUserMessage,
} from '../albumDetailValidation';

describe('albumDetailValidation', () => {
	it('rejects empty, short, and overlong fields (ADM-U1)', () => {
		expect(validateReasonAndUserMessage({ reason: '', userMessage: '' }).valid).toBe(false);
		expect(
			validateReasonAndUserMessage({ reason: '123456789', userMessage: '123456789' }).valid
		).toBe(false);
		const long = 'x'.repeat(2001);
		expect(validateReasonAndUserMessage({ reason: long, userMessage: long }).valid).toBe(false);
		expect(
			validateReasonAndUserMessage({
				reason: 'valid reason here',
				userMessage: 'valid message here',
			}).valid
		).toBe(true);
		const invalid = validateReasonAndUserMessage({ reason: 'x', userMessage: 'y' });
		expect(invalid.valid).toBe(false);
		expect(invalid.reasonError).toBe('min');
	});

	it('syncs user message from reason when unchanged (ADM-U7)', () => {
		expect(shouldSyncUserMessageFromReason('new reason', '', '')).toBe(true);
		expect(shouldSyncUserMessageFromReason('new reason', 'old sync', 'old sync')).toBe(true);
		expect(shouldSyncUserMessageFromReason('new reason', 'custom text', 'old sync')).toBe(false);
		expect(nextSyncedUserMessage('copied')).toBe('copied');
	});
});
