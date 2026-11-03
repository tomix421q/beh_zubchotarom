<script lang="ts">
	import Hero from '#lib/components/organism/Hero.svelte';
	import PhotoSlider from '#lib/components/organism/PhotoSlider.svelte';
	import EditionInfo from '#lib/components/organism/EditionInfo.svelte';
	import { SITE_NAME } from '../lib/constants';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{SITE_NAME} {data.edition.year}</title>
</svelte:head>

<div class="flex flex-col gap-10">
	<Hero edition={data.edition} logoUrl={data.logoUrl} />

	<EditionInfo
		year={data.edition.year}
		stats={data.edition.stats}
		infoHtml={data.edition.infoHtml}
	/>

	{#if data.photos.length > 0}
		<PhotoSlider photos={data.photos} />
	{/if}
</div>
