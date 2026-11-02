import { error } from '@sveltejs/kit';
import { prisma } from '../lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { edition } = await parent();

	// The home page shows the current edition, so without one there is nothing to render
	if (!edition) error(404, 'Aktuálny ročník sa nenašiel.');

	// Photos keep the order set in the admin, so the slider shows them left to right
	const photos = await prisma.photo.findMany({
		where: { isActive: true },
		orderBy: [{ order: 'asc' }, { id: 'asc' }]
	});

	return { edition, photos };
};
