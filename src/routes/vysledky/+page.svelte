<script lang="ts">
	import Button from '#lib/components/atoms/Button.svelte';
	import { SITE_NAME } from '../../lib/constants';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Výsledky · {SITE_NAME}</title>
</svelte:head>

<section class="flex flex-col items-start gap-6">
	<h1 class="text-3xl font-bold text-foreground">Výsledky</h1>
	{#if data.edition.resultsUrl}
		<Button href={data.edition.resultsUrl}>Zobraziť výsledky</Button>
	{:else}
		<p class="text-muted-foreground">Výsledky budú zverejnené po pretekoch.</p>
	{/if}
</section>
