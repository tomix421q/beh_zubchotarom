import { prisma } from '../../../lib/server/db';
import { findEditionByYear } from '../../../lib/server/editions';
import { sanitizeInfoHtml } from '../../../lib/server/sanitizeInfoHtml';
import type { PageServerLoad } from './$types';

// Any year can be opened, so its own stats and text are loaded here; a year that does not exist is a 404
export const load: PageServerLoad = async ({ params }) => {
	const found = await findEditionByYear(params.year);
	// The id is the tie-break, so the order of stats stays the same between loads
	const stats = await prisma.editionStat.findMany({
		where: { editionId: found.id },
		orderBy: [{ order: 'asc' }, { id: 'asc' }]
	});

	return {
		edition: { ...found, infoHtml: sanitizeInfoHtml(found.infoHtml), stats }
	};
};
