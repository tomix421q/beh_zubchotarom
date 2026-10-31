import { prisma } from '../lib/server/db';
import { shuffle } from '../lib/utils/front/shuffle';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [photos, sponsors] = await Promise.all([
		prisma.photo.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
		prisma.sponsor.findMany({ orderBy: { order: 'asc' } })
	]);

	return { photos: shuffle(photos), sponsors };
};
