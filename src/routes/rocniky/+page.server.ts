import { prisma } from '../../lib/server/db';
import type { PageServerLoad } from './$types';

// Newest first, so the archive reads from the latest edition back to the first one
export const load: PageServerLoad = async () => {
	const editions = await prisma.edition.findMany({ orderBy: { year: 'desc' } });

	return { editions };
};
