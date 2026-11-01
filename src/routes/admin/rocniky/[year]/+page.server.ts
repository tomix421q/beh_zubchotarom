import { fail, redirect } from '@sveltejs/kit';
import { requireAdmin } from '../../../../lib/server/auth';
import { prisma } from '../../../../lib/server/db';
import {
	findEditionByYear,
	isYearTaken,
	readEditionFields,
	syncCurrentEdition
} from '../../../../lib/server/editions';
import { readInfoHtml } from '../../../../lib/server/sanitizeInfoHtml';
import { formatBratislavaDateTime } from '../../../../lib/utils/dateUtils';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	requireAdmin(locals);

	const edition = await findEditionByYear(params.year);

	return { edition, eventDateInput: formatBratislavaDateTime(edition.eventDate) };
};

export const actions: Actions = {
	saveEdition: async ({ request, locals, params }) => {
		requireAdmin(locals);

		const edition = await findEditionByYear(params.year);
		const fields = readEditionFields(await request.formData());
		if ('message' in fields) return fail(400, { message: fields.message });

		if (await isYearTaken(fields.year, edition.id)) {
			return fail(400, { message: `Ročník ${fields.year} už existuje.` });
		}

		await prisma.edition.update({ where: { id: edition.id }, data: fields });
		// Changing the year can move the newest edition, so the current flag is recomputed
		await syncCurrentEdition();

		redirect(303, `/admin/rocniky/${fields.year}`);
	},

	// An unchecked checkbox is not sent at all, so its absence means the registration is closed
	saveRegistration: async ({ request, locals, params }) => {
		requireAdmin(locals);

		const edition = await findEditionByYear(params.year);
		const formData = await request.formData();

		await prisma.edition.update({
			where: { id: edition.id },
			data: { registrationOpen: formData.has('registrationOpen') }
		});
	},

	saveInfo: async ({ request, locals, params }) => {
		requireAdmin(locals);

		const edition = await findEditionByYear(params.year);
		const infoHtml = readInfoHtml(await request.formData(), 'html');

		await prisma.edition.update({ where: { id: edition.id }, data: { infoHtml } });
	}
};
