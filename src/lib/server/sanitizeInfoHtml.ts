import sanitizeHtml from 'sanitize-html';

// Info text comes from the database and later from the editor, so only plain formatting is allowed.
// The only span allowed is the editor's "notice" style, and it keeps no other class
export function sanitizeInfoHtml(html: string | null): string {
	return sanitizeHtml(html ?? '', {
		allowedTags: ['p', 'h2', 'h3', 'h4', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'br', 'span'],
		allowedAttributes: { a: ['href'], span: ['class'] },
		allowedClasses: { span: ['notice'] },
		allowedSchemes: ['http', 'https', 'mailto']
	});
}

// An editor with no text sends an empty paragraph, which is stored as null so no empty box is shown
export function readInfoHtml(formData: FormData, name: string): string | null {
	const html = sanitizeInfoHtml(String(formData.get(name) ?? ''));

	return html.replace(/<[^>]*>/g, '').trim() ? html : null;
}
