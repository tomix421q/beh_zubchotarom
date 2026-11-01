import { requireAdmin } from '../../../../../lib/server/auth';
import { prisma } from '../../../../../lib/server/db';
import { findEditionByYear } from '../../../../../lib/server/editions';
import { readInfoHtml } from '../../../../../lib/server/sanitizeInfoHtml';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	requireAdmin(locals);

	return { edition: await findEditionByYear(params.year) };
};

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		requireAdmin(locals);

		const edition = await findEditionByYear(params.year);
		// Sanitized on the way in, so the stored text is already safe for the public page
		const registrationHtml = readInfoHtml(await request.formData(), 'html');

		await prisma.edition.update({ where: { id: edition.id }, data: { registrationHtml } });

		return { saved: true };
	}
};
