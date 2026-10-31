import { describe, expect, it } from 'vitest';
import { sanitizeInfoHtml } from './sanitizeInfoHtml';

describe('sanitizeInfoHtml', () => {
	it('returns an empty string when there is no info text', () => {
		expect(sanitizeInfoHtml(null)).toBe('');
	});

	it('keeps allowed formatting and drops scripts', () => {
		expect(sanitizeInfoHtml('<p>Ahoj <strong>svet</strong></p><script>alert(1)</script>')).toBe(
			'<p>Ahoj <strong>svet</strong></p>'
		);
	});

	it('removes event handler attributes', () => {
		expect(sanitizeInfoHtml('<p onclick="steal()">text</p>')).toBe('<p>text</p>');
	});

	it('removes javascript links but keeps normal ones', () => {
		expect(sanitizeInfoHtml('<a href="javascript:alert(1)">klik</a>')).toBe('<a>klik</a>');
		expect(sanitizeInfoHtml('<a href="https://example.sk">web</a>')).toBe(
			'<a href="https://example.sk">web</a>'
		);
	});
});
