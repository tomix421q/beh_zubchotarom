import { fail, redirect } from '@sveltejs/kit';
import { requireAdmin } from '../../../../lib/server/auth';
import { prisma } from '../../../../lib/server/db';
import {
	findEditionByYear,
	isHttpsUrl,
	isYearTaken,
	readEditionFields,
	syncCurrentEdition
} from '../../../../lib/server/editions';
import { readInfoHtml } from '../../../../lib/server/sanitizeInfoHtml';
import { sweepUnusedUploads } from '../../../../lib/server/uploadCleanup';
import { deleteUpload, savePdf } from '../../../../lib/server/uploads';
import { formatBratislavaDateTime } from '../../../../lib/utils/dateUtils';
import type { Actions, PageServerLoad } from './$types';

// Both parts are required, an empty stat would show up empty on the home page
function readStatFields(
	formData: FormData
): { label: string; value: string } | { message: string } {
	const label = String(formData.get('label') ?? '').trim();
	const value = String(formData.get('value') ?? '').trim();

	if (!label || !value) return { message: 'Vyplňte kľúč aj hodnotu.' };

	return { label, value };
}

// The id comes from a hidden form field; the edition check keeps a stat of another edition out
async function findStatFromForm(editionId: number, formData: FormData) {
	const id = Number(formData.get('id'));

	return Number.isInteger(id) ? prisma.editionStat.findFirst({ where: { id, editionId } }) : null;
}

// The id is the tie-break, so the order of stats stays the same between loads
function listStats(editionId: number) {
	return prisma.editionStat.findMany({
		where: { editionId },
		orderBy: [{ order: 'asc' }, { id: 'asc' }]
	});
}

export const load: PageServerLoad = async ({ locals, params }) => {
	requireAdmin(locals);

	const edition = await findEditionByYear(params.year);
	const stats = await listStats(edition.id);

	return { edition, stats, eventDateInput: formatBratislavaDateTime(edition.eventDate) };
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

	// The results are either a link or an uploaded PDF; saving one replaces the other, and an old file is removed at once
	saveResultsUrl: async ({ request, locals, params }) => {
		requireAdmin(locals);

		const edition = await findEditionByYear(params.year);
		const resultsUrl = String((await request.formData()).get('resultsUrl') ?? '').trim();
		if (!isHttpsUrl(resultsUrl)) {
			return fail(400, {
				resultsMessage: 'Odkaz na výsledky musí byť adresa začínajúca na https://.'
			});
		}

		await prisma.edition.update({ where: { id: edition.id }, data: { resultsUrl } });
		await deleteUpload(edition.resultsUrl);
	},

	uploadResultsPdf: async ({ request, locals, params }) => {
		requireAdmin(locals);

		const edition = await findEditionByYear(params.year);
		const result = await savePdf((await request.formData()).get('resultsPdf'));
		if ('message' in result) return fail(400, { resultsMessage: result.message });

		await prisma.edition.update({ where: { id: edition.id }, data: { resultsUrl: result.url } });
		await deleteUpload(edition.resultsUrl);
	},

	deleteResults: async ({ locals, params }) => {
		requireAdmin(locals);

		const edition = await findEditionByYear(params.year);

		await prisma.edition.update({ where: { id: edition.id }, data: { resultsUrl: null } });
		await deleteUpload(edition.resultsUrl);
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
		await sweepUnusedUploads();
	},

	addStat: async ({ request, locals, params }) => {
		requireAdmin(locals);

		const edition = await findEditionByYear(params.year);
		const fields = readStatFields(await request.formData());
		if ('message' in fields) return fail(400, { statMessage: fields.message });

		// The max is used instead of a count, so a new stat never ties with one left gapped by a delete.
		// Read and write share a transaction so two concurrent adds cannot pick the same order
		await prisma.$transaction(async (tx) => {
			const maxOrder = await tx.editionStat.aggregate({
				where: { editionId: edition.id },
				_max: { order: true }
			});

			await tx.editionStat.create({
				data: { ...fields, editionId: edition.id, order: (maxOrder._max.order ?? -1) + 1 }
			});
		});
	},

	saveStat: async ({ request, locals, params }) => {
		requireAdmin(locals);

		const edition = await findEditionByYear(params.year);
		const formData = await request.formData();
		const stat = await findStatFromForm(edition.id, formData);
		if (!stat) return fail(404, { statMessage: 'Štatistika sa nenašla.' });

		const fields = readStatFields(formData);
		if ('message' in fields) return fail(400, { statMessage: fields.message });

		await prisma.editionStat.update({ where: { id: stat.id }, data: fields });
	},

	// Swaps the stat with its neighbour; every stat is renumbered so the order stays unique
	moveStat: async ({ request, locals, params }) => {
		requireAdmin(locals);

		const edition = await findEditionByYear(params.year);
		const formData = await request.formData();
		const stat = await findStatFromForm(edition.id, formData);
		if (!stat) return fail(404, { statMessage: 'Štatistika sa nenašla.' });

		const direction = formData.get('direction');
		if (direction !== 'up' && direction !== 'down') {
			return fail(400, { statMessage: 'Neplatný smer posunu.' });
		}

		const stats = await listStats(edition.id);
		const index = stats.findIndex((item) => item.id === stat.id);
		const target = index + (direction === 'up' ? -1 : 1);
		// The first stat cannot move up and the last cannot move down, so there is nothing to swap
		if (target < 0 || target >= stats.length) return;

		const reordered = [...stats];
		[reordered[index], reordered[target]] = [reordered[target], reordered[index]];

		await prisma.$transaction(
			reordered.map((item, order) =>
				prisma.editionStat.update({ where: { id: item.id }, data: { order } })
			)
		);
	},

	deleteStat: async ({ request, locals, params }) => {
		requireAdmin(locals);

		const edition = await findEditionByYear(params.year);
		const stat = await findStatFromForm(edition.id, await request.formData());
		if (!stat) return fail(404, { statMessage: 'Štatistika sa nenašla.' });

		await prisma.editionStat.delete({ where: { id: stat.id } });
	}
};
