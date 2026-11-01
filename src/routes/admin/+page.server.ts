import { dev } from '$app/env';
import { error, fail, redirect } from '@sveltejs/kit';
import {
	ADMIN_COOKIE,
	SESSION_SECONDS,
	createSessionToken,
	isPasswordValid
} from '../../lib/server/auth';
import { isLoginBlocked, recordFailedLogin } from '../../lib/server/loginLimiter';
import type { Actions, PageServerLoad } from './$types';

// A 404 instead of a redirect, so the existence of the admin area is not revealed
export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.isAdmin) error(404, 'Stránka sa nenašla.');

	return {};
};

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
