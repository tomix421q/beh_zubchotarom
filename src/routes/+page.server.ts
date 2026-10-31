import { error } from '@sveltejs/kit';
import { prisma } from '../lib/server/db';
import { sanitizeInfoHtml } from '../lib/server/sanitizeInfoHtml';
import { shuffle } from '../lib/utils/front/shuffle';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const edition = await prisma.edition.findFirst({
		where: { isCurrent: true },
		include: { routes: true, stats: { orderBy: { order: 'asc' } } }
	});

	if (!edition) {
		error(404, { message: 'Aktuálny ročník sa nenašiel.' });
	}

	const [photos, sponsors] = await Promise.all([
		prisma.photo.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
		prisma.sponsor.findMany({ orderBy: { order: 'asc' } })
	]);

	return {
		edition: {
			...edition,
			infoHtml: sanitizeInfoHtml(edition.infoHtml),
			propositionsHtml: sanitizeInfoHtml(edition.propositionsHtml)
		},
		photos: shuffle(photos),
		sponsors
	};
};
