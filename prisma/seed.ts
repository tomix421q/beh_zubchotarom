import { prisma } from '../src/lib/server/db';

// Sample data for local development; dates and edition numbers are placeholders
async function main() {
	await prisma.edition.upsert({
		where: { year: 2025 },
		update: {},
		create: {
			year: 2025,
			editionNumber: 1,
			eventDate: new Date('2025-06-07'),
			isCurrent: false
		}
	});

	await prisma.edition.upsert({
		where: { year: 2026 },
		update: {},
		create: {
			year: 2026,
			editionNumber: 2,
			eventDate: new Date('2026-06-06'),
			isCurrent: true,
			routes: {
				create: [
					{ name: '5 km', distanceKm: 5, elevationM: 60 },
					{ name: '10 km', distanceKm: 10, elevationM: 140 }
				]
			}
		}
	});
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
