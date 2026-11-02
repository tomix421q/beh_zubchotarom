import { LOGO_URL } from '../lib/constants';
import { prisma } from '../lib/server/db';
import { sanitizeInfoHtml } from '../lib/server/sanitizeInfoHtml';
import type { LayoutServerLoad } from './$types';

// The current edition is shared by every page, so it is loaded once here.
// It can be missing (a fresh database), so this layout never 404s; pages decide what to show without it
export const load: LayoutServerLoad = async ({ locals }) => {
	const [edition, settings, sponsors] = await Promise.all([
		prisma.edition.findFirst({
			where: { isCurrent: true },
			include: { routes: true, stats: { orderBy: { order: 'asc' } } }
		}),
		prisma.siteSetting.findUnique({ where: { id: 1 } }),
		// Sponsors are shown in the navbar on every page, each row keeps the order set in the admin
		prisma.sponsor.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] })
	]);

	return {
		isAdmin: locals.isAdmin,
		// The logo is set in the admin; until one is uploaded the bundled logo is used
		logoUrl: settings?.logoUrl ?? LOGO_URL,
		sponsors,
		edition: edition
			? {
					...edition,
					infoHtml: sanitizeInfoHtml(edition.infoHtml),
					propositionsHtml: sanitizeInfoHtml(edition.propositionsHtml),
					registrationHtml: sanitizeInfoHtml(edition.registrationHtml)
				}
			: null
	};
};
