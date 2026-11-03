import { dev } from '$app/env';
import { fail, redirect } from '@sveltejs/kit';
import {
	ADMIN_COOKIE,
	SESSION_SECONDS,
	createSessionToken,
	isPasswordValid,
	requireAdmin
} from '../../lib/server/auth';
import { prisma } from '../../lib/server/db';
import { isLoginBlocked, recordFailedLogin } from '../../lib/server/loginLimiter';
import type { Actions, PageServerLoad } from './$types';

// A 404 instead of a redirect, so the existence of the admin area is not revealed.
// The tiles only need a short summary of each part; the logo and background come from the layout data
export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);

	const [editionCount, currentEdition, photoCount, sponsorCount, settings] = await Promise.all([
		prisma.edition.count(),
		prisma.edition.findFirst({
			where: { isCurrent: true },
			select: { year: true, editionNumber: true }
		}),
		prisma.photo.count(),
		prisma.sponsor.count(),
		prisma.siteSetting.findUnique({ where: { id: 1 } })
	]);

	return {
		editionCount,
		currentEdition,
		photoCount,
		sponsorCount,
		hasContact: Boolean(settings?.contactHtml || settings?.contactMapUrl)
	};
};

// The login stays here because AdminCorner posts the password to /admin?/login
export const actions: Actions = {
	login: async ({ request, cookies, getClientAddress }) => {
		const ip = getClientAddress();
		const now = Date.now();

		if (isLoginBlocked(ip, now)) {
			return fail(429, { message: 'Príliš veľa pokusov. Skúste to o chvíľu.' });
		}

		const password = String((await request.formData()).get('password') ?? '');

		if (!isPasswordValid(password)) {
			recordFailedLogin(ip, now);
			return fail(401, { message: 'Nesprávne heslo.' });
		}

		cookies.set(ADMIN_COOKIE, createSessionToken(now), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: SESSION_SECONDS
		});

		redirect(303, '/admin');
	},

	logout: async ({ cookies }) => {
		cookies.delete(ADMIN_COOKIE, { path: '/' });

		redirect(303, '/');
	}
};
