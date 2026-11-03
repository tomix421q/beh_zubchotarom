import { fail } from '@sveltejs/kit';
import { requireAdmin } from '../../../lib/server/auth';
import { prisma } from '../../../lib/server/db';
import { isHttpsUrl } from '../../../lib/server/editions';
import { deleteUpload, saveImage } from '../../../lib/server/uploads';
import type { Actions, PageServerLoad } from './$types';

// The same tie-break as photos; the home page and the navbar read the sponsors in this order too
function listSponsors() {
	return prisma.sponsor.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] });
}

// The id comes from a hidden form field, so anything that is not a whole number finds no sponsor
async function findSponsorFromForm(formData: FormData) {
	const id = Number(formData.get('id'));

	return Number.isInteger(id) ? prisma.sponsor.findUnique({ where: { id } }) : null;
}

// A 404 instead of a redirect, so the existence of the admin area is not revealed
export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);

	return { sponsors: await listSponsors() };
};

export const actions: Actions = {
	// The logo is optional; a sponsor without one is shown by name. The row and the link are checked before anything is written
	addSponsor: async ({ request, locals }) => {
		requireAdmin(locals);

		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		if (!name) return fail(400, { sponsorMessage: 'Vyplňte názov sponzora.' });

		const webUrl = String(formData.get('webUrl') ?? '').trim() || null;
		if (webUrl && !isHttpsUrl(webUrl)) {
			return fail(400, { sponsorMessage: 'Odkaz na web musí byť adresa začínajúca na https://.' });
		}

		const row = formData.get('row');
		if (row !== 'top' && row !== 'bottom') {
			return fail(400, { sponsorMessage: 'Neplatný rad sponzorov.' });
		}

		// The logo is either an uploaded file or a link to an image, never both, so nothing is ignored silently
		const logoLink = String(formData.get('logoUrl') ?? '').trim() || null;
		if (logoLink && !isHttpsUrl(logoLink)) {
			return fail(400, { sponsorMessage: 'Odkaz na logo musí byť adresa začínajúca na https://.' });
		}

		// An empty file input still gives a File, but with no bytes, so it means no file
		const logo = formData.get('logo');
		const hasLogoFile = logo instanceof File && logo.size > 0;
		if (hasLogoFile && logoLink) {
			return fail(400, {
				sponsorMessage: 'Logo nahrajte buď ako súbor, alebo zadajte odkaz, nie oboje.'
			});
		}

		let logoUrl: string | null = logoLink;
		if (hasLogoFile) {
			const result = await saveImage(logo);
			if ('message' in result) return fail(400, { sponsorMessage: result.message });

			logoUrl = result.url;
		}

		const isMain = formData.get('isMain') === 'on';

		// The new sponsor goes to the end. The max is used instead of a count,
		// so a gap left by a delete is never reused
		try {
			await prisma.$transaction(async (tx) => {
				const maxOrder = await tx.sponsor.aggregate({ _max: { order: true } });

				await tx.sponsor.create({
					data: {
						name,
						webUrl,
						logoUrl,
						row,
						isMain,
						order: (maxOrder._max.order ?? -1) + 1
					}
				});
			});
		} catch (cause) {
			// The logo is already on disk, so it is removed when no row points at it
			await deleteUpload(logoUrl);
			throw cause;
		}
	},

	// The main sponsor flag only changes the label under the logo, the sponsor keeps its row and place
	toggleMain: async ({ request, locals }) => {
		requireAdmin(locals);

		const sponsor = await findSponsorFromForm(await request.formData());
		if (!sponsor) return fail(404, { sponsorMessage: 'Sponzor sa nenašiel.' });

		await prisma.sponsor.update({ where: { id: sponsor.id }, data: { isMain: !sponsor.isMain } });
	},

	// A sponsor moved to the other row goes to its end, so it never takes the place of a sponsor already there
	moveSponsorRow: async ({ request, locals }) => {
		requireAdmin(locals);

		const sponsor = await findSponsorFromForm(await request.formData());
		if (!sponsor) return fail(404, { sponsorMessage: 'Sponzor sa nenašiel.' });

		await prisma.$transaction(async (tx) => {
			const maxOrder = await tx.sponsor.aggregate({ _max: { order: true } });

			await tx.sponsor.update({
				where: { id: sponsor.id },
				data: {
					row: sponsor.row === 'top' ? 'bottom' : 'top',
					order: (maxOrder._max.order ?? -1) + 1
				}
			});
		});
	},

	// Swaps the sponsor with its neighbour in the same row; only the two orders change, the other sponsors keep theirs
	moveSponsor: async ({ request, locals }) => {
		requireAdmin(locals);

		const formData = await request.formData();
		const sponsor = await findSponsorFromForm(formData);
		if (!sponsor) return fail(404, { sponsorMessage: 'Sponzor sa nenašiel.' });

		const direction = formData.get('direction');
		if (direction !== 'up' && direction !== 'down') {
			return fail(400, { sponsorMessage: 'Neplatný smer posunu.' });
		}

		await prisma.$transaction(async (tx) => {
			// Read inside the transaction, so a move made at the same time cannot be lost
			const rowSponsors = await tx.sponsor.findMany({
				where: { row: sponsor.row },
				orderBy: [{ order: 'asc' }, { id: 'asc' }]
			});
			const index = rowSponsors.findIndex((item) => item.id === sponsor.id);
			const target = index + (direction === 'up' ? -1 : 1);
			// The first sponsor of a row cannot move up and the last cannot move down, so there is nothing to swap
			if (index < 0 || target < 0 || target >= rowSponsors.length) return;

			await tx.sponsor.update({
				where: { id: sponsor.id },
				data: { order: rowSponsors[target].order }
			});
			await tx.sponsor.update({
				where: { id: rowSponsors[target].id },
				data: { order: rowSponsors[index].order }
			});
		});
	},

	deleteSponsor: async ({ request, locals }) => {
		requireAdmin(locals);

		const sponsor = await findSponsorFromForm(await request.formData());
		if (!sponsor) return fail(404, { sponsorMessage: 'Sponzor sa nenašiel.' });

		await prisma.sponsor.delete({ where: { id: sponsor.id } });
		// The logo goes after the row, like photos. Name-only sponsors have no file, so nothing is removed
		await deleteUpload(sponsor.logoUrl);
	}
};
