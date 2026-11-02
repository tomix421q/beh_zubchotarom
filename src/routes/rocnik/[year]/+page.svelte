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

<div class="flex flex-col gap-10">
	<Hero edition={data.edition} logoUrl={data.logoUrl} />

	<EditionInfo
		year={data.edition.year}
		stats={data.edition.stats}
		infoHtml={data.edition.infoHtml}
	/>

	{#if data.edition.galleryUrl}
		<div class="flex justify-center">
			<Button href={data.edition.galleryUrl} target="_blank" rel="noopener noreferrer" size="lg">
				Fotogaléria
			</Button>
		</div>
	{/if}
</div>
