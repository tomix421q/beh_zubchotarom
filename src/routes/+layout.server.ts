import { error } from '@sveltejs/kit';
import { prisma } from '../lib/server/db';
import { sanitizeInfoHtml } from '../lib/server/sanitizeInfoHtml';
import type { LayoutServerLoad } from './$types';

// The current edition is shared by every page, so it is loaded once here
export const load: LayoutServerLoad = async ({ locals }) => {
	const edition = await prisma.edition.findFirst({
		where: { isCurrent: true },
		include: { routes: true, stats: { orderBy: { order: 'asc' } } }
	});

	if (!edition) {
		error(404, 'Aktuálny ročník sa nenašiel.');
	}

	return {
		isAdmin: locals.isAdmin,
		edition: {
			...edition,
			infoHtml: sanitizeInfoHtml(edition.infoHtml),
			propositionsHtml: sanitizeInfoHtml(edition.propositionsHtml)
		}
	};
};
