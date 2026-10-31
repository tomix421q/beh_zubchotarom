import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PhotoSlider from './PhotoSlider.svelte';

const photos = [
	{ id: 1, url: '/logo1.png', alt: 'Prvá fotka' },
	{ id: 2, url: '/logo2.png', alt: 'Druhá fotka' }
];

describe('PhotoSlider.svelte', () => {
	it('moves to the next photo with the arrow button', async () => {
		render(PhotoSlider, { photos });

		await page.getByRole('button', { name: 'Ďalšia fotka' }).click();

		await expect
			.element(page.getByRole('button', { name: 'Fotka 2 z 2' }))
			.toHaveAttribute('aria-current', 'true');
	});

	it('switches the pause button between pause and play', async () => {
		render(PhotoSlider, { photos });

		await page.getByRole('button', { name: 'Pozastaviť slider' }).click();

		await expect.element(page.getByRole('button', { name: 'Spustiť slider' })).toBeInTheDocument();
	});
});
