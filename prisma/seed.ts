import { prisma } from '../src/lib/server/db';

// Sample data for local development; dates, URLs, stats and sponsor names are placeholders.
// Editions are upserted with their full data, so re-running the seed updates existing rows.
const sampleRoutes = {
	create: [
		{ name: '5 km', distanceKm: 5, elevationM: 60 },
		{ name: '10 km', distanceKm: 10, elevationM: 140 }
	]
};

const edition2025 = {
	editionNumber: 1,
	eventDate: new Date('2025-06-07'),
	isCurrent: false
};

const edition2026 = {
	editionNumber: 2,
	eventDate: new Date('2026-06-06'),
	isCurrent: false,
	resultsUrl: 'https://behzubrohlava.sk/vysledky/2026'
};

const edition2027 = {
	editionNumber: 3,
	eventDate: new Date('2027-06-05'),
	isCurrent: true,
	registrationUrl: 'https://behzubrohlava.sk/registracia/2027'
};

// Stats belong to the current edition; the seed owns them, so they are replaced on every run
const stats2027 = [
	{ label: 'Štartujúcich bežcov', value: '312', order: 0 },
	{ label: 'Dobehlo do cieľa', value: '298', order: 1 },
	{ label: 'Dobrovoľníkov', value: '45', order: 2 }
];

// Sponsors are a global list; they are only seeded when the table is empty so admin edits survive
const sampleSponsors = [
	{ name: 'Ukážkový sponzor A', webUrl: 'https://example.com', order: 0 },
	{ name: 'Ukážkový sponzor B', order: 1 }
];

async function main() {
	await prisma.edition.upsert({
		where: { year: 2025 },
		update: edition2025,
		create: { year: 2025, ...edition2025 }
	});

	await prisma.edition.upsert({
		where: { year: 2026 },
		update: edition2026,
		create: { year: 2026, ...edition2026, routes: sampleRoutes }
	});

	await prisma.edition.upsert({
		where: { year: 2027 },
		update: { ...edition2027, stats: { deleteMany: {}, create: stats2027 } },
		create: { year: 2027, ...edition2027, routes: sampleRoutes, stats: { create: stats2027 } }
	});

	if ((await prisma.sponsor.count()) === 0) {
		await prisma.sponsor.createMany({ data: sampleSponsors });
	}
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
