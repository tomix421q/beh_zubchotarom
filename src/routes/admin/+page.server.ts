import { dev } from '$app/env';
import { fail, redirect } from '@sveltejs/kit';
import {
	ADMIN_COOKIE,
	SESSION_SECONDS,
	createSessionToken,
	isPasswordValid,
	requireAdmin
} from '../../lib/server/auth';
import {
	findEditionFromForm,
	isYearTaken,
	readEditionFields,
	syncCurrentEdition
} from '../../lib/server/editions';
import { prisma } from '../../lib/server/db';
import { isLoginBlocked, recordFailedLogin } from '../../lib/server/loginLimiter';
import { deleteUpload, saveImage } from '../../lib/server/uploads';
import type { Actions, PageServerLoad } from './$types';

// A 404 instead of a redirect, so the existence of the admin area is not revealed
export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);

	const editions = await prisma.edition.findMany({ orderBy: { year: 'desc' } });

	return { editions };
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
	},

	createEdition: async ({ request, locals }) => {
		requireAdmin(locals);

		const fields = readEditionFields(await request.formData());
		if ('message' in fields) return fail(400, { message: fields.message });

		if (await isYearTaken(fields.year)) {
			return fail(400, { message: `Ročník ${fields.year} už existuje.` });
		}

		await prisma.edition.create({ data: fields });
		await syncCurrentEdition();

		redirect(303, `/admin/rocniky/${fields.year}`);
	},

	deleteEdition: async ({ request, locals }) => {
		requireAdmin(locals);

		const edition = await findEditionFromForm(await request.formData());
		if (!edition) return fail(404, { message: 'Ročník sa nenašiel.' });

		await prisma.edition.delete({ where: { id: edition.id } });
		await syncCurrentEdition();
	},

	// The old logo file is deleted only after the new one is stored, so a failed save keeps the current logo
	saveLogo: async ({ request, locals }) => {
		requireAdmin(locals);

		const result = await saveImage((await request.formData()).get('logo'));
		if ('message' in result) return fail(400, { message: result.message });

		const previous = await prisma.siteSetting.findUnique({ where: { id: 1 } });
		await prisma.siteSetting.upsert({
			where: { id: 1 },
			create: { id: 1, logoUrl: result.url },
			update: { logoUrl: result.url }
		});

		// Only uploaded logos are deleted; the bundled default logo is a static file and is never touched
		await deleteUpload(previous?.logoUrl);
	}
};
