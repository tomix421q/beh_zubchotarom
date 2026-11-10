import { fail, redirect } from '@sveltejs/kit';
import { requireAdmin } from '../../../lib/server/auth';
import {
	findEditionFromForm,
	isYearTaken,
	readEditionFields,
	syncCurrentEdition
} from '../../../lib/server/editions';
import { prisma } from '../../../lib/server/db';
import { sweepUnusedUploads } from '../../../lib/server/uploadCleanup';
import type { Actions, PageServerLoad } from './$types';

// A 404 instead of a redirect, so the existence of the admin area is not revealed
export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);

	return { editions: await prisma.edition.findMany({ orderBy: { year: 'desc' } }) };
};

export const actions: Actions = {
	createEdition: async ({ request, locals }) => {
		requireAdmin(locals);

		const fields = readEditionFields(await request.formData());
		if ('message' in fields) return fail(400, { message: fields.message });

		if (await isYearTaken(fields.year)) {
			return fail(400, { message: `Ročník ${fields.year} už existuje.` });
		}

		await prisma.edition.create({ data: fields });
		await syncCurrentEdition();

		redirect(303, `/admin/rocniky/${fields.year}`);
	},

	deleteEdition: async ({ request, locals }) => {
		requireAdmin(locals);

		const edition = await findEditionFromForm(await request.formData());
		if (!edition) return fail(404, { message: 'Ročník sa nenašiel.' });

		await prisma.edition.delete({ where: { id: edition.id } });
		await syncCurrentEdition();
		// Images and files only this edition used are now unused
		await sweepUnusedUploads();
	}
};
