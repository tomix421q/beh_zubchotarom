<script lang="ts">
	import Hero from '#lib/components/organism/Hero.svelte';
	import PhotoSlider from '#lib/components/organism/PhotoSlider.svelte';
	import EditionInfo from '#lib/components/organism/EditionInfo.svelte';
	import SponsorMarquee from '#lib/components/organism/SponsorMarquee.svelte';
	import Button from '#lib/components/atoms/Button.svelte';
	import { SITE_NAME } from '../lib/constants';
	import { splitIntoRows } from '../lib/utils/front/sponsorRows';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const sponsorRows = $derived(splitIntoRows(data.sponsors));
</script>

<svelte:head>
	<title>{SITE_NAME} {data.edition.year}</title>
</svelte:head>

<div class="flex flex-col gap-10">
	<Hero edition={data.edition} />

	{#if data.photos.length > 0}
		<PhotoSlider photos={data.photos} />
	{/if}

	<EditionInfo stats={data.edition.stats} infoHtml={data.edition.infoHtml} />

	{#if data.sponsors.length > 0}
		<SponsorMarquee rows={sponsorRows} />
	{/if}

	<section id="propozicie" class="flex flex-col gap-4">
		<h2 class="text-2xl font-bold text-foreground">Propozície</h2>
		{#if data.edition.propositionsHtml}
			<!-- propositionsHtml is sanitized on the server before it reaches the page -->
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<div class="prose max-w-none text-foreground">{@html data.edition.propositionsHtml}</div>
		{:else}
			<p class="text-muted-foreground">Propozície budú zverejnené čoskoro.</p>
		{/if}
	</section>

	<section id="trasy" class="flex flex-col gap-4">
		<h2 class="text-2xl font-bold text-foreground">Trasy</h2>
		{#if data.edition.routes.length > 0}
			<ul class="grid gap-4 sm:grid-cols-2">
				{#each data.edition.routes as route (route.id)}
					<li class="rounded-lg border border-border bg-card p-4">
						<p class="text-lg font-semibold text-foreground">{route.name}</p>
						<p class="text-muted-foreground">
							{route.distanceKm} km{route.elevationM !== null
								? `, prevýšenie ${route.elevationM} m`
								: ''}
						</p>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-muted-foreground">Trasy budú zverejnené čoskoro.</p>
		{/if}
	</section>

	<section id="vysledky" class="flex flex-col items-start gap-4">
		<h2 class="text-2xl font-bold text-foreground">Výsledky</h2>
		{#if data.edition.resultsUrl}
			<Button href={data.edition.resultsUrl}>Zobraziť výsledky</Button>
		{:else}
			<p class="text-muted-foreground">Výsledky budú zverejnené po pretekoch.</p>
		{/if}
	</section>

	<section id="kontakt" class="flex flex-col gap-4">
		<h2 class="text-2xl font-bold text-foreground">Kontakt</h2>
		<p class="text-muted-foreground">Kontaktné údaje budú doplnené.</p>
	</section>
</div>
