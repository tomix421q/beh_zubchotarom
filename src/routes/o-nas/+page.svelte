<script lang="ts">
	import { SITE_NAME } from '../../lib/constants';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>O nás · {SITE_NAME}</title>
</svelte:head>

<section class="glassCard flex flex-col gap-6 p-6">
	<h1 class="text-3xl font-bold text-foreground">O nás</h1>
	{#if data.aboutHtml}
		<!-- aboutHtml is sanitized on the server before it reaches the page -->
		<div class="prose max-w-none text-foreground prose-invert">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html data.aboutHtml}
		</div>
	{:else}
		<p class="text-muted-foreground">Príbeh klubu budeme čoskoro dopĺňať.</p>
	{/if}
</section>
