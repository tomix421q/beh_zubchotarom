import { error } from '@sveltejs/kit';
import { readUpload } from '../../../lib/server/uploads';
import type { RequestHandler } from './$types';

// Uploads are public and their names never change, so browsers can keep them for a year
export const GET: RequestHandler = async ({ params }) => {
	const upload = await readUpload(params.name);
	if (!upload) error(404, 'Súbor sa nenašiel.');

	return new Response(upload.body, {
		headers: {
			'Content-Type': upload.mime,
			'Cache-Control': 'public, max-age=31536000, immutable',
			'X-Content-Type-Options': 'nosniff'
		}
	});
};
