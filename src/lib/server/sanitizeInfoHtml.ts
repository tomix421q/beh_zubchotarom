import sanitizeHtml from 'sanitize-html';

// Only images uploaded through the admin are allowed in a text, never an outside address
const UPLOADED_IMAGE_SRC = /^\/uploads\/[0-9a-f-]{36}\.(jpg|png|webp|avif)$/;

// Text colours are fixed classes styled by tokens; "notice" is the older red style, kept so stored texts still show
export const TEXT_COLOR_CLASSES = ['notice', 'textRed', 'textYellow', 'textGreen', 'textGray'];
export const IMAGE_ALIGN_CLASSES = ['imgFull', 'imgLeft', 'imgRight'];

// Info text comes from the editor, so only the formatting the editor offers is allowed.
// Colours and image placement come only from the classes above; inline styles are always dropped
export function sanitizeInfoHtml(html: string | null): string {
	return sanitizeHtml(html ?? '', {
		allowedTags: [
			'p',
			'h2',
			'h3',
			'h4',
			'strong',
			'em',
			'ul',
			'ol',
			'li',
			'a',
			'br',
			'span',
			'img',
			'table',
			'thead',
			'tbody',
			'tr',
			'th',
			'td'
		],
		allowedAttributes: {
			a: ['href'],
			span: ['class'],
			img: ['src', 'alt', 'class']
		},
		allowedClasses: { span: TEXT_COLOR_CLASSES, img: IMAGE_ALIGN_CLASSES },
		allowedSchemes: ['http', 'https', 'mailto'],
		exclusiveFilter: (frame) =>
			frame.tag === 'img' && !UPLOADED_IMAGE_SRC.test(frame.attribs.src ?? '')
	});
}

// An editor with no text sends an empty paragraph, which is stored as null so no empty box is shown.
// A text with only an image or a table is not empty
export function readInfoHtml(formData: FormData, name: string): string | null {
	const html = sanitizeInfoHtml(String(formData.get(name) ?? ''));
	const hasContent = /<(img|table)\b/.test(html) || html.replace(/<[^>]*>/g, '').trim() !== '';

	return hasContent ? html : null;
}
