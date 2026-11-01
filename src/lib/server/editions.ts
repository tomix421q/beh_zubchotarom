import { error } from '@sveltejs/kit';
import { FIRST_EDITION_YEAR } from '../constants';
import { parseBratislavaDateTime } from '../utils/dateUtils';
import { prisma } from './db';

export type EditionFields = {
	year: number;
	editionNumber: number;
	eventDate: Date;
	heroTitle: string | null;
};

// Looked up by year from the URL; anything that is not an existing year is a 404
export async function findEditionByYear(yearParam: string) {
	const year = Number(yearParam);
	const edition = Number.isInteger(year)
		? await prisma.edition.findUnique({ where: { year } })
		: null;

	if (!edition) error(404, 'Ročník sa nenašiel.');

	return edition;
}

// Validates the form shared by create and save; returns the first problem found, in Slovak, for the user
export function readEditionFields(formData: FormData): EditionFields | { message: string } {
	const year = Number(formData.get('year'));
	const editionNumber = Number(formData.get('editionNumber'));
	const eventDate = parseBratislavaDateTime(String(formData.get('eventDate') ?? ''));
	// An empty title means the default "Beh Zubrohlava + year" is shown in the Hero
	const heroTitle = String(formData.get('heroTitle') ?? '').trim() || null;

	if (!Number.isInteger(year) || year < FIRST_EDITION_YEAR) {
		return { message: `Rok musí byť celé číslo od ${FIRST_EDITION_YEAR}.` };
	}

	if (!Number.isInteger(editionNumber) || editionNumber < 1) {
		return { message: 'Poradové číslo musí byť kladné celé číslo.' };
	}

	if (Number.isNaN(eventDate.getTime())) {
		return { message: 'Zadajte platný dátum a čas.' };
	}

	return { year, editionNumber, eventDate, heroTitle };
}

// Years are unique; exceptId lets an edition keep its own year when it is saved
export async function isYearTaken(year: number, exceptId?: number): Promise<boolean> {
	const edition = await prisma.edition.findUnique({ where: { year } });

	return !!edition && edition.id !== exceptId;
}

// The id comes from a hidden form field, so anything that is not a whole number finds no edition
export async function findEditionFromForm(formData: FormData) {
	const id = Number(formData.get('id'));

	return Number.isInteger(id) ? prisma.edition.findUnique({ where: { id } }) : null;
}

// The newest edition is always the current one, so the flag is recomputed after every change to the years
export function syncCurrentEdition() {
	return prisma.$transaction(async (tx) => {
		const newest = await tx.edition.findFirst({ orderBy: { year: 'desc' } });

		await tx.edition.updateMany({ data: { isCurrent: false } });
		if (newest) await tx.edition.update({ where: { id: newest.id }, data: { isCurrent: true } });
	});
}
