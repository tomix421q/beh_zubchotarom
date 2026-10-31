import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SponsorMarquee from './SponsorMarquee.svelte';

const withLogo = { id: 1, name: 'Sponzor s logom', logoUrl: '/logo1.png', webUrl: null };
const withoutLogo = { id: 2, name: 'Sponzor bez loga', logoUrl: null, webUrl: null };

describe('SponsorMarquee.svelte', () => {
	it('shows the name overlay for a sponsor without a logo', async () => {
		render(SponsorMarquee, { rows: [[withLogo], [withoutLogo]] });

		// The loop copy repeats the name, so check the first visible one
		await expect
			.element(page.getByText('Sponzor bez loga', { exact: true }).first())
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('img', { name: 'Sponzor s logom' }))
			.toHaveAttribute('src', '/logo1.png');
	});

	it('toggles the shared pause button for both rows', async () => {
		render(SponsorMarquee, { rows: [[withLogo], [withoutLogo]] });

		await page.getByRole('button', { name: 'Pozastaviť sponzorov' }).click();

		await expect
			.element(page.getByRole('button', { name: 'Spustiť sponzorov' }))
			.toBeInTheDocument();
	});
});
