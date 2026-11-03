// Google gives "Embed a map" as an <iframe> snippet, but only its src is needed.
// The admin may paste either the whole snippet or the bare address; anything that
// is not a Google Maps embed address is rejected, so no other site can be framed
export function parseMapEmbedUrl(input: string): string | null {
	const text = input.trim();
	if (!text) return null;

	// The snippet has the address in src="..."; &amp; is how it is written inside HTML
	const fromSnippet = text.match(/\ssrc\s*=\s*["']([^"']+)["']/i)?.[1];
	const address = (fromSnippet ?? text).replaceAll('&amp;', '&');

	try {
		const url = new URL(address);
		const isEmbedPath =
			url.pathname.startsWith('/maps/embed') || url.pathname.startsWith('/maps/d/embed');

		return url.protocol === 'https:' && url.hostname === 'www.google.com' && isEmbedPath
			? url.href
			: null;
	} catch {
		return null;
	}
}
