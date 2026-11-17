<script lang="ts">
	import { resolve } from '$app/paths';
	import { Info } from '@lucide/svelte';
	import Hero from '#lib/components/organism/Hero.svelte';
	import PhotoSlider from '#lib/components/organism/PhotoSlider.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { DEFAULT_INFO_BUTTON_LABEL, SITE_NAME } from '../lib/constants';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// The edition text and stats live on the edition page; the button only shows when there is something to read there.
	// It is outlined, so it reads as a button on the glass card even when it is the only action
	const hasEditionInfo = $derived(!!data.edition.infoHtml || data.edition.stats.length > 0);
</script>

<svelte:head>
	<title>{SITE_NAME} {data.edition.year}</title>
</svelte:head>

<div class="flex flex-col gap-10">
	<Hero edition={data.edition} logoUrl={data.logoUrl}>
		{#snippet actions()}
			{#if hasEditionInfo}
				<Button
					href={resolve('/rocnik/[year]', { year: String(data.edition.year) })}
					variant="outline"
					size="lg"
					class="h-11 px-6 text-base"
				>
					<Info data-icon="inline-start" class="size-5" />
					{data.edition.infoButtonLabel ?? DEFAULT_INFO_BUTTON_LABEL}
				</Button>
			{/if}
		{/snippet}
	</Hero>

	{#if data.photos.length > 0}
		<PhotoSlider photos={data.photos} />
	{/if}
</div>
