import { error } from '@sveltejs/kit';
import { prisma } from '../lib/server/db';
import { shuffle } from '../lib/utils/front/shuffle';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { edition } = await parent();

	// The home page shows the current edition, so without one there is nothing to render
	if (!edition) error(404, 'Aktuálny ročník sa nenašiel.');

	const [photos, sponsors] = await Promise.all([
		prisma.photo.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
		prisma.sponsor.findMany({ orderBy: { order: 'asc' } })
	]);

	return { edition, photos: shuffle(photos), sponsors };
};
