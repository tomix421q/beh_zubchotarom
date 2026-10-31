import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Hero from './Hero.svelte';

const DAY_MS = 24 * 60 * 60 * 1000;

const edition = {
	id: 1,
	year: 2026,
	editionNumber: 2,
	eventDate: new Date(Date.now() + 3 * DAY_MS),
	isCurrent: true,
	registrationUrl: 'https://registracia.example/2026',
	resultsUrl: 'https://vysledky.example/2026',
	galleryUrl: null,
	propositionsHtml: null,
	infoHtml: null
};

describe('Hero.svelte', () => {
	it('shows the countdown and registration link before the event', async () => {
		render(Hero, { edition });

		await expect.element(page.getByText('Dní', { exact: true })).toBeInTheDocument();
		await expect
			.element(page.getByRole('link', { name: 'Registrovať sa' }))
			.toHaveAttribute('href', 'https://registracia.example/2026');
	});

	it('hides the countdown and links to results after the event day', async () => {
		render(Hero, {
			edition: { ...edition, eventDate: new Date('2020-01-01T00:00:00Z') }
		});

		await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('2026');
		await expect.element(page.getByText('Dní', { exact: true })).not.toBeInTheDocument();
		await expect
			.element(page.getByRole('link', { name: 'Výsledky' }))
			.toHaveAttribute('href', 'https://vysledky.example/2026');
	});
});
