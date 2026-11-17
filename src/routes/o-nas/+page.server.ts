import { prisma } from '../../lib/server/db';
import { sanitizeInfoHtml } from '../../lib/server/sanitizeInfoHtml';
import type { PageServerLoad } from './$types';

// Sanitized again on the way out, like the other editor texts
export const load: PageServerLoad = async () => {
	const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });

	return { aboutHtml: sanitizeInfoHtml(settings?.aboutHtml ?? null) };
};
