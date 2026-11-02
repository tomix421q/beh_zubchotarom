<script lang="ts">
	import EditionInfo from '#lib/components/organism/EditionInfo.svelte';
	import Hero from '#lib/components/organism/Hero.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { SITE_NAME } from '../../../lib/constants';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Ročník {data.edition.year} · {SITE_NAME}</title>
</svelte:head>
<a href={resolve('/admin')} class="text-sm text-muted-foreground hover:text-foreground">
	← Späť na administráciu
</a>
<div class="flex flex-col gap-10">
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

	<EditionInfo
		year={data.edition.year}
		stats={data.edition.stats}
		infoHtml={data.edition.infoHtml}
	/>
</div>
