import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Results live on each edition now, so old /vysledky links go to the archive
export const load: PageServerLoad = () => {
	redirect(308, '/rocniky');
};
