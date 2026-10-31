import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import EditionInfo from './EditionInfo.svelte';

describe('EditionInfo.svelte', () => {
	it('shows each statistic with its value', async () => {
		render(EditionInfo, {
			stats: [{ id: 1, label: 'Štartujúcich bežcov', value: '312' }],
			infoHtml: '<p>Informácie o ročníku</p>'
		});

		await expect.element(page.getByText('Štartujúcich bežcov')).toBeInTheDocument();
		await expect.element(page.getByText('312', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Informácie o ročníku')).toBeInTheDocument();
	});
});
