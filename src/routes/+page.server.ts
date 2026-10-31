import { error } from '@sveltejs/kit';
import { prisma } from '../lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const edition = await prisma.edition.findFirst({
		where: { isCurrent: true },
		include: { routes: true, sponsors: true }
	});

	if (!edition) {
		error(404, { message: 'Aktuálny ročník sa nenašiel.' });
	}

	return { edition };
};
