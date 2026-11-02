import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { UPLOADS_DIR } from '$app/env/private';

const UPLOAD_URL_PREFIX = '/uploads/';

const MAX_BYTES = 5 * 1024 * 1024;

type UploadType = {
	mime: string;
	ext: string;
	// Checks the file's first bytes, so a renamed or spoofed file is refused even with a correct MIME type
	matches: (bytes: Buffer) => boolean;
};

// SVG is left out on purpose, it can carry scripts
const IMAGE_TYPES: UploadType[] = [
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

// Results are published as a PDF; every PDF starts with "%PDF-"
const PDF_TYPE: UploadType = {
	mime: 'application/pdf',
	ext: 'pdf',
	matches: (bytes) => bytes.toString('latin1', 0, 5) === '%PDF-'
};

const UPLOAD_TYPES = [...IMAGE_TYPES, PDF_TYPE];

// Only names in this shape are served or deleted; the pattern also blocks path traversal like "../"
const UPLOAD_NAME = new RegExp(
	`^[0-9a-f-]{36}\\.(${UPLOAD_TYPES.map((type) => type.ext).join('|')})$`
);

function uploadPath(name: string): string {
	return join(UPLOADS_DIR, name);
}

// Checks size, declared type and magic bytes, then stores the file under a random name
async function saveFile(
	file: FormDataEntryValue | null,
	types: UploadType[],
	messages: { missing: string; tooBig: string; type: string; invalid: string }
): Promise<{ url: string } | { message: string }> {
	if (!(file instanceof File) || file.size === 0) return { message: messages.missing };
	if (file.size > MAX_BYTES) return { message: messages.tooBig };

	const declaredType = types.find((uploadType) => uploadType.mime === file.type);
	if (!declaredType) return { message: messages.type };

	const bytes = Buffer.from(await file.arrayBuffer());
	if (!declaredType.matches(bytes)) return { message: messages.invalid };

	// A random name means the original file name is never trusted or shown
	const name = `${randomUUID()}.${declaredType.ext}`;
	await mkdir(UPLOADS_DIR, { recursive: true });
	await writeFile(uploadPath(name), bytes);

	return { url: `${UPLOAD_URL_PREFIX}${name}` };
}

// Returns the URL to store, or a message to show the user; the caller decides what to do with a failure
export function saveImage(file: FormDataEntryValue | null) {
	return saveFile(file, IMAGE_TYPES, {
		missing: 'Vyberte obrázok.',
		tooBig: 'Obrázok môže mať najviac 5 MB.',
		type: 'Podporované sú len formáty JPEG, PNG, WebP a AVIF.',
		invalid: 'Súbor nie je platný obrázok.'
	});
}

export function savePdf(file: FormDataEntryValue | null) {
	return saveFile(file, [PDF_TYPE], {
		missing: 'Vyberte súbor PDF.',
		tooBig: 'Súbor PDF môže mať najviac 5 MB.',
		type: 'Podporovaný je len formát PDF.',
		invalid: 'Súbor nie je platné PDF.'
	});
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

	const uploadType = UPLOAD_TYPES.find((type) => name.endsWith(`.${type.ext}`));
	const body = await readFile(uploadPath(name)).catch(() => null);

	// A plain Uint8Array is what Response accepts as a body
	return body && uploadType ? { body: new Uint8Array(body), mime: uploadType.mime } : null;
}
