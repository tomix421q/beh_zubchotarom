import { error } from '@sveltejs/kit';
import { statUpload, streamUpload } from '../../../lib/server/uploads';
import type { RequestHandler } from './$types';

// Only a single "bytes=start-end" range is supported, which is all a browser asks for when playing a video.
// Returns null for no range, and 'invalid' for one that cannot be served
function parseRange(
	header: string | null,
	size: number
): { start: number; end: number } | null | 'invalid' {
	if (!header) return null;

	const match = /^bytes=(\d*)-(\d*)$/.exec(header);
	if (!match || (!match[1] && !match[2])) return 'invalid';

	// "bytes=-500" means the last 500 bytes
	const start = match[1] ? Number(match[1]) : Math.max(size - Number(match[2]), 0);
	const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;

	return start <= end && start < size ? { start, end } : 'invalid';
}

// Uploads are public and their names never change, so browsers can keep them for a year
export const GET: RequestHandler = async ({ params, request }) => {
	const upload = await statUpload(params.name);
	if (!upload) error(404, 'Súbor sa nenašiel.');

	const headers = {
		'Content-Type': upload.mime,
		'Cache-Control': 'public, max-age=31536000, immutable',
		'X-Content-Type-Options': 'nosniff',
		// Safari does not play a video from a server that does not accept ranges
		'Accept-Ranges': 'bytes'
	};

	const range = parseRange(request.headers.get('range'), upload.size);

	if (range === 'invalid') {
		return new Response(null, {
			status: 416,
			headers: { ...headers, 'Content-Range': `bytes */${upload.size}` }
		});
	}

	if (!range) {
		return new Response(streamUpload(params.name, 0, upload.size - 1), {
			headers: { ...headers, 'Content-Length': String(upload.size) }
		});
	}

	return new Response(streamUpload(params.name, range.start, range.end), {
		status: 206,
		headers: {
			...headers,
			'Content-Length': String(range.end - range.start + 1),
			'Content-Range': `bytes ${range.start}-${range.end}/${upload.size}`
		}
	});
};
