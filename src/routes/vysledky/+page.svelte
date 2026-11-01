<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { SITE_NAME } from '../../lib/constants';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Výsledky · {SITE_NAME}</title>
</svelte:head>

<section class="glassCard flex flex-col items-start gap-6 p-6">
	<h1 class="text-3xl font-bold text-foreground">Výsledky</h1>
	{#if data.edition?.resultsUrl}
		<Button href={data.edition.resultsUrl} size="lg">Zobraziť výsledky</Button>
	{:else}
		<p class="text-muted-foreground">Výsledky budú zverejnené po pretekoch.</p>
	{/if}
</section>
