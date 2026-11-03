import { prisma } from '../../lib/server/db';
import { sanitizeInfoHtml } from '../../lib/server/sanitizeInfoHtml';
import { parseMapEmbedUrl } from '../../lib/utils/googleMaps';
import type { PageServerLoad } from './$types';

// Sanitized again on the way out, like the other editor texts
export const load: PageServerLoad = async () => {
	const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });

	return {
		contactHtml: sanitizeInfoHtml(settings?.contactHtml ?? null),
		// Checked again on the way out, so only a Google Maps address is ever framed
		contactMapUrl: parseMapEmbedUrl(settings?.contactMapUrl ?? '')
	};
};
