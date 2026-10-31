<script lang="ts">
	import { SITE_NAME } from '../../lib/constants';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Propozície · {SITE_NAME}</title>
</svelte:head>

<section class="flex flex-col gap-6">
	<h1 class="text-3xl font-bold text-foreground">Propozície</h1>
	{#if data.edition.propositionsHtml}
		<!-- propositionsHtml is sanitized on the server before it reaches the page -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div class="prose max-w-none text-foreground">{@html data.edition.propositionsHtml}</div>
	{:else}
		<p class="text-muted-foreground">Propozície budú zverejnené čoskoro.</p>
	{/if}
</section>
