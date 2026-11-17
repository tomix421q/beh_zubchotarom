import { requireAdmin } from '../../../lib/server/auth';
import { prisma } from '../../../lib/server/db';
import { readInfoHtml } from '../../../lib/server/sanitizeInfoHtml';
import { sweepUnusedUploads } from '../../../lib/server/uploadCleanup';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);

	const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });

	return { aboutHtml: settings?.aboutHtml ?? '' };
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		requireAdmin(locals);

		// Sanitized on the way in, so the stored text is already safe for the public page
		const aboutHtml = readInfoHtml(await request.formData(), 'html');

		// The row may not exist yet on a fresh database, like with the logo
		await prisma.siteSetting.upsert({
			where: { id: 1 },
			create: { id: 1, aboutHtml },
			update: { aboutHtml }
		});
		await sweepUnusedUploads();
	}
};
