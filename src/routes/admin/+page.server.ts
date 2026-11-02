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

// The id is the tie-break, so the order of photos stays the same between loads
function listPhotos() {
	return prisma.photo.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] });
}

// The id comes from a hidden form field, so anything that is not a whole number finds no photo
async function findPhotoFromForm(formData: FormData) {
	const id = Number(formData.get('id'));

	return Number.isInteger(id) ? prisma.photo.findUnique({ where: { id } }) : null;
}

// A 404 instead of a redirect, so the existence of the admin area is not revealed
export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);

	const [editions, photos] = await Promise.all([
		prisma.edition.findMany({ orderBy: { year: 'desc' } }),
		listPhotos()
	]);

	return { editions, photos };
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
	},

	// The alt text is checked before the file is saved, so a rejected form leaves no file behind
	uploadPhoto: async ({ request, locals }) => {
		requireAdmin(locals);

		const formData = await request.formData();
		const alt = String(formData.get('alt') ?? '').trim();
		if (!alt) return fail(400, { photoMessage: 'Vyplňte popis fotky.' });

		const result = await saveImage(formData.get('photo'));
		if ('message' in result) return fail(400, { photoMessage: result.message });

		// The new photo goes to the end. The max is used instead of a count,
		// so a gap left by a delete is never reused
		try {
			await prisma.$transaction(async (tx) => {
				const maxOrder = await tx.photo.aggregate({ _max: { order: true } });

				await tx.photo.create({
					data: { url: result.url, alt, order: (maxOrder._max.order ?? -1) + 1 }
				});
			});
		} catch (cause) {
			// The file is already on disk, so it is removed when no row points at it
			await deleteUpload(result.url);
			throw cause;
		}
	},

	// A hidden photo stays in the list, it is only left out of the home page slider
	toggleActive: async ({ request, locals }) => {
		requireAdmin(locals);

		const photo = await findPhotoFromForm(await request.formData());
		if (!photo) return fail(404, { photoMessage: 'Fotka sa nenašla.' });

		await prisma.photo.update({ where: { id: photo.id }, data: { isActive: !photo.isActive } });
	},

	// Swaps the photo with its neighbour; every photo is renumbered so the order stays unique
	movePhoto: async ({ request, locals }) => {
		requireAdmin(locals);

		const formData = await request.formData();
		const photo = await findPhotoFromForm(formData);
		if (!photo) return fail(404, { photoMessage: 'Fotka sa nenašla.' });

		const direction = formData.get('direction');
		if (direction !== 'up' && direction !== 'down') {
			return fail(400, { photoMessage: 'Neplatný smer posunu.' });
		}

		await prisma.$transaction(async (tx) => {
			// Read inside the transaction, so a move made at the same time cannot be lost
			const photos = await tx.photo.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] });
			const index = photos.findIndex((item) => item.id === photo.id);
			const target = index + (direction === 'up' ? -1 : 1);
			// The first photo cannot move up and the last cannot move down, so there is nothing to swap
			if (target < 0 || target >= photos.length) return;

			const reordered = [...photos];
			[reordered[index], reordered[target]] = [reordered[target], reordered[index]];

			await Promise.all(
				reordered.map((item, order) => tx.photo.update({ where: { id: item.id }, data: { order } }))
			);
		});
	},

	deletePhoto: async ({ request, locals }) => {
		requireAdmin(locals);

		const photo = await findPhotoFromForm(await request.formData());
		if (!photo) return fail(404, { photoMessage: 'Fotka sa nenašla.' });

		await prisma.photo.delete({ where: { id: photo.id } });
		// The file goes after the row, so a failed delete never leaves a row pointing at a missing file.
		// Only uploaded photos are removed; the bundled mockups are static files and stay
		await deleteUpload(photo.url);
	}
};
