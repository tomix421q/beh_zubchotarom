<script lang="ts">
	import { resolve } from '$app/paths';
	import EditionStats from '#lib/components/organism/EditionStats.svelte';
	import EditionText from '#lib/components/organism/EditionText.svelte';
	import Hero from '#lib/components/organism/Hero.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { SITE_NAME } from '../../../lib/constants';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Ročník {data.edition.year} · {SITE_NAME}</title>
</svelte:head>
<!-- The current edition is reached from the home page button, so its way back is home -->
{#if data.edition.isCurrent}
	<a href={resolve('/')} class="text-sm text-muted-foreground hover:text-foreground">
		← Späť na domov
	</a>
{:else}
	<a href={resolve('/vysledky')} class="text-sm text-muted-foreground hover:text-foreground">
		← Späť na všetky ročníky
	</a>
{/if}
<div class="mt-4 flex flex-col gap-10">
	<Hero edition={data.edition} logoUrl={data.logoUrl}>
		{#snippet actions()}
			{#if data.edition.galleryUrl}
				<Button
					href={data.edition.galleryUrl}
					target="_blank"
					rel="noopener noreferrer"
					size="lg"
					class="h-11 px-6 text-base"
				>
					Fotogaléria
				</Button>
			{/if}
		{/snippet}
	</Hero>

	<EditionStats year={data.edition.year} stats={data.edition.stats} />
	<EditionText infoHtml={data.edition.infoHtml} />
</div>
