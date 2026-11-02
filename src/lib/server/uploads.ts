import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { UPLOADS_DIR } from '$app/env/private';

const UPLOAD_URL_PREFIX = '/uploads/';

const MAX_BYTES = 5 * 1024 * 1024;

type ImageType = {
	mime: string;
	ext: string;
	// Checks the file's first bytes, so a renamed or spoofed file is refused even with a correct MIME type
	matches: (bytes: Buffer) => boolean;
};

// SVG is left out on purpose, it can carry scripts
const IMAGE_TYPES: ImageType[] = [
	{ mime: 'image/jpeg', ext: 'jpg', matches: (bytes) => bytes.toString('hex', 0, 3) === 'ffd8ff' },
	{
		mime: 'image/png',
		ext: 'png',
		matches: (bytes) => bytes.toString('hex', 0, 8) === '89504e470d0a1a0a'
	},
	{
		mime: 'image/webp',
		ext: 'webp',
		matches: (bytes) =>
			bytes.toString('latin1', 0, 4) === 'RIFF' && bytes.toString('latin1', 8, 12) === 'WEBP'
	},
	{
		mime: 'image/avif',
		ext: 'avif',
		matches: (bytes) =>
			bytes.toString('latin1', 4, 8) === 'ftyp' &&
			['avif', 'avis'].includes(bytes.toString('latin1', 8, 12))
	}
];

// Only names in this shape are served or deleted; the pattern also blocks path traversal like "../"
const UPLOAD_NAME = new RegExp(
	`^[0-9a-f-]{36}\\.(${IMAGE_TYPES.map((type) => type.ext).join('|')})$`
);

function uploadPath(name: string): string {
	return join(UPLOADS_DIR, name);
}

// Returns the URL to store, or a message to show the user; the caller decides what to do with a failure
export async function saveImage(
	file: FormDataEntryValue | null
): Promise<{ url: string } | { message: string }> {
	if (!(file instanceof File) || file.size === 0) return { message: 'Vyberte obrázok.' };
	if (file.size > MAX_BYTES) return { message: 'Obrázok môže mať najviac 5 MB.' };

	const declaredType = IMAGE_TYPES.find((imageType) => imageType.mime === file.type);
	if (!declaredType) return { message: 'Podporované sú len formáty JPEG, PNG, WebP a AVIF.' };

	const bytes = Buffer.from(await file.arrayBuffer());
	if (!declaredType.matches(bytes)) return { message: 'Súbor nie je platný obrázok.' };

	// A random name means the original file name is never trusted or shown
	const name = `${randomUUID()}.${declaredType.ext}`;
	await mkdir(UPLOADS_DIR, { recursive: true });
	await writeFile(uploadPath(name), bytes);

	return { url: `${UPLOAD_URL_PREFIX}${name}` };
}

// Only files stored under /uploads/ are removed, so a static asset such as the default logo is never touched
export async function deleteUpload(url: string | null | undefined): Promise<void> {
	if (!url?.startsWith(UPLOAD_URL_PREFIX)) return;

	const name = url.slice(UPLOAD_URL_PREFIX.length);
	if (!UPLOAD_NAME.test(name)) return;

	await rm(uploadPath(name), { force: true });
}

// Null when the name is not one this module creates or the file is missing
export async function readUpload(
	name: string
): Promise<{ body: Uint8Array<ArrayBuffer>; mime: string } | null> {
	if (!UPLOAD_NAME.test(name)) return null;

	const imageType = IMAGE_TYPES.find((type) => name.endsWith(`.${type.ext}`));
	const body = await readFile(uploadPath(name)).catch(() => null);

	// A plain Uint8Array is what Response accepts as a body
	return body && imageType ? { body: new Uint8Array(body), mime: imageType.mime } : null;
}
