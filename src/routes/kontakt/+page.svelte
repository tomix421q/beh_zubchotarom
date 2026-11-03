<script lang="ts">
	import MapEmbed from '#lib/components/atoms/MapEmbed.svelte';
	import { SITE_NAME } from '../../lib/constants';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Kontakt · {SITE_NAME}</title>
</svelte:head>

<section class="glassCard flex flex-col gap-6 p-6">
	<h1 class="text-3xl font-bold text-foreground">Kontakt</h1>
	{#if data.contactHtml}
		<!-- contactHtml is sanitized on the server before it reaches the page -->
		<div class="prose max-w-none text-foreground prose-invert">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html data.contactHtml}
		</div>
	{:else if !data.contactMapUrl}
		<p class="text-muted-foreground">Kontaktné údaje budú doplnené.</p>
	{/if}

	{#if data.contactMapUrl}
		<MapEmbed url={data.contactMapUrl} title="Mapa" />
	{/if}
</section>
