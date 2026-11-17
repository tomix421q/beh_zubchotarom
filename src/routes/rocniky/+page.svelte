<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
	import { SITE_NAME } from '../../lib/constants';
	import { formatEventDate, getEventStatus } from '../../lib/utils/dateUtils';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Fixed at load; the archive does not need a ticking clock
	const now = new Date();
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
				{@const status = getEventStatus(edition.eventDate, now)}
				<li class="flex flex-wrap items-center justify-between gap-3 py-4">
					<div>
						<p class="font-semibold text-foreground">{SITE_NAME} {edition.year}</p>
						<p class="text-sm text-muted-foreground">
							{edition.editionNumber}. ročník ·
							<!-- An edition that has not happened yet gets its date highlighted, so visitors spot it at once -->
							{#if status === 'past'}
								{formatEventDate(edition.eventDate)} (už sa konal)
							{:else}
								<span class="font-semibold text-primary">
									{status === 'today' ? 'Dnes' : formatEventDate(edition.eventDate)}
								</span>
							{/if}
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
