import type { Prisma } from '../generated/prisma/client';
import { prisma } from './db';
import { deleteUpload, listUploads } from './uploads';

// A file this young may belong to a text that is still being written and not yet saved
const GRACE_MS = 24 * 60 * 60 * 1000;

// Every table is read, so a file is kept wherever the database mentions it.
// Keyed by model name: a new model in the schema fails the type check until it is added here,
// so a file it refers to can never be taken for unused
const TABLES: Record<Prisma.ModelName, () => Promise<unknown[]>> = {
	Edition: () => prisma.edition.findMany(),
	Route: () => prisma.route.findMany(),
	EditionStat: () => prisma.editionStat.findMany(),
	SiteSetting: () => prisma.siteSetting.findMany(),
	Sponsor: () => prisma.sponsor.findMany(),
	Photo: () => prisma.photo.findMany()
};

// Deletes uploads that nothing in the database refers to: images removed from a text, images uploaded in
// the editor but never saved, files of a deleted edition. A failure is only logged, so a save never fails on it
export async function sweepUnusedUploads(now = Date.now()): Promise<void> {
	try {
		const uploads = await listUploads();
		const candidates = uploads.filter((upload) => now - upload.modifiedAt > GRACE_MS);
		if (candidates.length === 0) return;

		// The file name is random, so finding it anywhere in the data means it is in use
		const rows = await Promise.all(Object.values(TABLES).map((read) => read()));
		const data = JSON.stringify(rows);

		for (const upload of candidates) {
			if (!data.includes(upload.name)) await deleteUpload(upload.url);
		}
	} catch (error) {
		console.error('Cleaning unused uploads failed', error);
	}
}
