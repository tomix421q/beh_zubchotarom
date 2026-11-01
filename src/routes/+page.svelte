<script lang="ts">
	import Hero from '#lib/components/organism/Hero.svelte';
	import PhotoSlider from '#lib/components/organism/PhotoSlider.svelte';
	import EditionInfo from '#lib/components/organism/EditionInfo.svelte';
	import SponsorMarquee from '#lib/components/organism/SponsorMarquee.svelte';
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

	<EditionInfo stats={data.edition.stats} />

	{#if data.sponsors.length > 0}
		<SponsorMarquee rows={sponsorRows} />
	{/if}
</div>
