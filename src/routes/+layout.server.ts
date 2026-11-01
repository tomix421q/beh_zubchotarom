import { prisma } from '../lib/server/db';
import { sanitizeInfoHtml } from '../lib/server/sanitizeInfoHtml';
import type { LayoutServerLoad } from './$types';

// The current edition is shared by every page, so it is loaded once here.
// It can be missing (a fresh database), so this layout never 404s; pages decide what to show without it
export const load: LayoutServerLoad = async ({ locals }) => {
	const edition = await prisma.edition.findFirst({
		where: { isCurrent: true },
		include: { routes: true, stats: { orderBy: { order: 'asc' } } }
	});

	return {
		isAdmin: locals.isAdmin,
		edition: edition
			? {
					...edition,
					infoHtml: sanitizeInfoHtml(edition.infoHtml),
					propositionsHtml: sanitizeInfoHtml(edition.propositionsHtml)
				}
			: null
	};
};
