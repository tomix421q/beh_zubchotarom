import { fail } from '@sveltejs/kit';
import { requireAdmin } from '../../../lib/server/auth';
import { prisma } from '../../../lib/server/db';
import { parseMapEmbedUrl } from '../../../lib/utils/googleMaps';
import { readInfoHtml } from '../../../lib/server/sanitizeInfoHtml';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);

	const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });

	return {
		contactHtml: settings?.contactHtml ?? '',
		contactMapUrl: settings?.contactMapUrl ?? ''
	};
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		requireAdmin(locals);

		// Sanitized on the way in, so the stored text is already safe for the public page
		const formData = await request.formData();
		const contactHtml = readInfoHtml(formData, 'html');

		// The map is optional; a pasted snippet is reduced to its address, anything else is rejected
		const mapInput = String(formData.get('map') ?? '').trim();
		const contactMapUrl = parseMapEmbedUrl(mapInput);
		if (mapInput && !contactMapUrl) {
			return fail(400, { message: 'Mapa musí byť kód na vloženie mapy z Google Maps.' });
		}

		// The row may not exist yet on a fresh database, like with the logo
		await prisma.siteSetting.upsert({
			where: { id: 1 },
			create: { id: 1, contactHtml, contactMapUrl },
			update: { contactHtml, contactMapUrl }
		});

		return { saved: true };
	}
};
