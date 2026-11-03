import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
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

const MP4_BRANDS = ['isom', 'iso2', 'mp41', 'mp42', 'avc1', 'M4V '];

// Walks the top-level boxes of an mp4: the "moov" box must come before "mdat" (the "faststart" layout),
// otherwise the browser has to download the whole file before it can start playing
function hasFaststartLayout(bytes: Buffer): boolean {
	let offset = 0;

	while (offset + 8 <= bytes.length) {
		const type = bytes.toString('latin1', offset + 4, offset + 8);
		if (type === 'moov') return true;
		if (type === 'mdat') return false;

		let size = bytes.readUInt32BE(offset);
		// 1 means the real size follows as 64 bits, 0 means the box runs to the end of the file
		if (size === 1 && offset + 16 <= bytes.length) size = Number(bytes.readBigUInt64BE(offset + 8));
		if (size < 8) return false;

		offset += size;
	}

	return false;
}

// AVIF is an "ftyp" file too, but with its own brands, so the brand list keeps it from passing as video
const VIDEO_TYPE: UploadType = {
	mime: 'video/mp4',
	ext: 'mp4',
	matches: (bytes) =>
		bytes.toString('latin1', 4, 8) === 'ftyp' &&
		MP4_BRANDS.includes(bytes.toString('latin1', 8, 12)) &&
		hasFaststartLayout(bytes)
};

const UPLOAD_TYPES = [...IMAGE_TYPES, PDF_TYPE, VIDEO_TYPE];

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

export function saveVideo(file: FormDataEntryValue | null) {
	return saveFile(file, [VIDEO_TYPE], {
		missing: 'Vyberte video.',
		tooBig: 'Video môže mať najviac 5 MB.',
		type: 'Podporovaný je len formát mp4.',
		invalid: 'Súbor nie je platné mp4 video. Zakódujte ho s parametrom -movflags +faststart.'
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
export async function statUpload(name: string): Promise<{ size: number; mime: string } | null> {
	if (!UPLOAD_NAME.test(name)) return null;

	const uploadType = UPLOAD_TYPES.find((type) => name.endsWith(`.${type.ext}`));
	const info = await stat(uploadPath(name)).catch(() => null);

	return info?.isFile() && uploadType ? { size: info.size, mime: uploadType.mime } : null;
}

// Streams the bytes start..end (both included), so a video is never held in memory and can be played from any point
export function streamUpload(name: string, start: number, end: number): ReadableStream {
	return Readable.toWeb(createReadStream(uploadPath(name), { start, end })) as ReadableStream;
}
