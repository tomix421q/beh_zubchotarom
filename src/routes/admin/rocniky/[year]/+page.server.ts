import { error, fail, redirect } from '@sveltejs/kit';
import { requireAdmin } from '../../../../lib/server/auth';
import { prisma } from '../../../../lib/server/db';
import {
	isYearTaken,
	readEditionFields,
	syncCurrentEdition
} from '../../../../lib/server/editions';
import { formatBratislavaDateTime } from '../../../../lib/utils/dateUtils';
import type { Actions, PageServerLoad } from './$types';

// Looked up by year from the URL; anything that is not an existing year is a 404
async function findEdition(yearParam: string) {
	const year = Number(yearParam);
	const edition = Number.isInteger(year)
		? await prisma.edition.findUnique({ where: { year } })
		: null;

	if (!edition) error(404, 'Ročník sa nenašiel.');

	return edition;
}

export const load: PageServerLoad = async ({ locals, params }) => {
	requireAdmin(locals);

	const edition = await findEdition(params.year);

	return { edition, eventDateInput: formatBratislavaDateTime(edition.eventDate) };
};

export const actions: Actions = {
	saveEdition: async ({ request, locals, params }) => {
		requireAdmin(locals);

		const edition = await findEdition(params.year);
		const fields = readEditionFields(await request.formData());
		if ('message' in fields) return fail(400, { message: fields.message });

		if (await isYearTaken(fields.year, edition.id)) {
			return fail(400, { message: `Ročník ${fields.year} už existuje.` });
		}

		await prisma.edition.update({ where: { id: edition.id }, data: fields });
		// Changing the year can move the newest edition, so the current flag is recomputed
		await syncCurrentEdition();

		redirect(303, `/admin/rocniky/${fields.year}`);
	}
};
