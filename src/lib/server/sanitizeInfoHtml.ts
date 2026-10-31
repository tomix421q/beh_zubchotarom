import sanitizeHtml from 'sanitize-html';

// Info text comes from the database and later from the editor, so only plain formatting is allowed
export function sanitizeInfoHtml(html: string | null): string {
	return sanitizeHtml(html ?? '', {
		allowedTags: ['p', 'h2', 'h3', 'h4', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'br'],
		allowedAttributes: { a: ['href'] },
		allowedSchemes: ['http', 'https', 'mailto']
	});
}
