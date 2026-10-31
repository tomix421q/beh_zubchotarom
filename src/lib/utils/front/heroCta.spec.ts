import { describe, expect, it } from 'vitest';
import { getHeroCta } from './heroCta';

const edition = {
	eventDate: new Date('2026-06-06T00:00:00Z'),
	registrationUrl: 'https://registracia.example/2026',
	resultsUrl: 'https://vysledky.example/2026'
};

describe('getHeroCta', () => {
	it('points to registration before the event day', () => {
		expect(getHeroCta(edition, new Date('2026-05-01T10:00:00Z'))).toEqual({
			label: 'Registrovať sa',
			href: 'https://registracia.example/2026'
		});
	});

	it('keeps registration during the whole event day in Bratislava', () => {
		expect(getHeroCta(edition, new Date('2026-06-06T20:00:00Z'))).toEqual({
			label: 'Registrovať sa',
			href: 'https://registracia.example/2026'
		});
	});

	it('points to results from the day after the event', () => {
		expect(getHeroCta(edition, new Date('2026-06-06T22:30:00Z'))).toEqual({
			label: 'Výsledky',
			href: 'https://vysledky.example/2026'
		});
	});

	it('returns null when the registration link is missing before the event', () => {
		const withoutRegistration = { ...edition, registrationUrl: null };

		expect(getHeroCta(withoutRegistration, new Date('2026-05-01T10:00:00Z'))).toBeNull();
	});

	it('returns null when the results link is missing after the event', () => {
		const withoutResults = { ...edition, resultsUrl: null };

		expect(getHeroCta(withoutResults, new Date('2026-06-07T10:00:00Z'))).toBeNull();
	});
});
