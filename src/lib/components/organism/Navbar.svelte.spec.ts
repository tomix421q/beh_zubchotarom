import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Navbar from './Navbar.svelte';

describe('Navbar.svelte', () => {
	it('opens and closes the mobile menu from the hamburger button', async () => {
		render(Navbar);

		await page.getByRole('button', { name: 'Otvoriť menu' }).click();

		await expect.element(page.getByRole('button', { name: 'Zavrieť menu' })).toBeInTheDocument();
		// Stylesheet is not loaded here, so the desktop list is also in the DOM; the mobile list comes last
		await expect.element(page.getByRole('link', { name: 'Trasy' }).last()).toBeVisible();

		await page.getByRole('button', { name: 'Zavrieť menu' }).click();

		await expect.element(page.getByRole('button', { name: 'Otvoriť menu' })).toBeInTheDocument();
	});
});
