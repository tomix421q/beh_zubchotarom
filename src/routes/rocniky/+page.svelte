<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
	import { SITE_NAME } from '../../lib/constants';
	import { formatEventDate } from '../../lib/utils/dateUtils';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Všetky ročníky · {SITE_NAME}</title>
</svelte:head>

<section class="glassCard flex flex-col gap-6 p-6">
	<h1 class="text-3xl font-bold text-foreground">Všetky ročníky</h1>
	{#if data.editions.length === 0}
		<p class="text-muted-foreground">Zatiaľ nie sú zverejnené žiadne ročníky.</p>
	{:else}
		<ul class="flex flex-col divide-y divide-border">
			{#each data.editions as edition (edition.id)}
				<li class="flex flex-wrap items-center justify-between gap-3 py-4">
					<div>
						<p class="font-semibold text-foreground">{SITE_NAME} {edition.year}</p>
						<p class="text-sm text-muted-foreground">
							{edition.editionNumber}. ročník · {formatEventDate(edition.eventDate)}
						</p>
					</div>

					<Button
						href={resolve('/rocnik/[year]', { year: String(edition.year) })}
						variant="outline"
						size="sm"
					>
						Zobraziť
					</Button>
				</li>
			{/each}
		</ul>
	{/if}
</section>
