import { requireAdmin } from '../../../lib/server/auth';
import { saveImage } from '../../../lib/server/uploads';
import type { RequestHandler } from './$types';

// The text editor uploads an image here as soon as it is picked and inserts the returned address
export const POST: RequestHandler = async ({ request, locals }) => {
	requireAdmin(locals);

	// A body that is not a form is answered like a missing file, not with a server error
	const formData = await request.formData().catch(() => null);
	const result = await saveImage(formData?.get('file') ?? null);
	if ('message' in result) return Response.json(result, { status: 400 });

	return Response.json(result);
};
