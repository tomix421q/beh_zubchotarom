import { prisma } from '../src/lib/server/db';

// Sample data for local development; dates, URLs and edition numbers are placeholders.
// Each upsert writes the full edition on every run, so re-running the seed updates existing rows too.
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
		update: edition2027,
		create: { year: 2027, ...edition2027, routes: sampleRoutes }
	});
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
