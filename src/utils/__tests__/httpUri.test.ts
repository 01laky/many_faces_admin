import { describe, it, expect } from 'vitest';
import { isAbsoluteHttpUri } from '../httpUri';

describe('isAbsoluteHttpUri', () => {
	it('accepts absolute http and https URLs', () => {
		expect(isAbsoluteHttpUri('http://worker:50051')).toBe(true);
		expect(isAbsoluteHttpUri('https://mail.example.com')).toBe(true);
		expect(isAbsoluteHttpUri('  https://trimmed.example.com  ')).toBe(true);
	});

	it('rejects empty, relative, and non-http(s) URIs', () => {
		expect(isAbsoluteHttpUri('')).toBe(false);
		expect(isAbsoluteHttpUri('   ')).toBe(false);
		expect(isAbsoluteHttpUri('/relative/path')).toBe(false);
		expect(isAbsoluteHttpUri('worker:50051')).toBe(false);
		expect(isAbsoluteHttpUri('ftp://host/file')).toBe(false);
		expect(isAbsoluteHttpUri('not a url')).toBe(false);
	});
});
