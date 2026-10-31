import { error } from '@sveltejs/kit';
import { prisma } from '../lib/server/db';
import { sanitizeInfoHtml } from '../lib/server/sanitizeInfoHtml';
import type { LayoutServerLoad } from './$types';

// The current edition is shared by every page, so it is loaded once here
export const load: LayoutServerLoad = async () => {
	const edition = await prisma.edition.findFirst({
		where: { isCurrent: true },
		include: { routes: true, stats: { orderBy: { order: 'asc' } } }
	});

	if (!edition) {
		error(404, { message: 'Aktuálny ročník sa nenašiel.' });
	}

	return {
		edition: {
			...edition,
			infoHtml: sanitizeInfoHtml(edition.infoHtml),
			propositionsHtml: sanitizeInfoHtml(edition.propositionsHtml)
		}
	};
};
