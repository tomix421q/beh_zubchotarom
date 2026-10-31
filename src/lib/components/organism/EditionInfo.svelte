<script lang="ts">
	type Stat = { id: number; label: string; value: string };

	let { stats, infoHtml }: { stats: Stat[]; infoHtml: string | null } = $props();
</script>

<section class="flex flex-col gap-8">
	{#if stats.length > 0}
		<dl class="grid grid-cols-2 gap-4 sm:grid-cols-3">
			{#each stats as stat (stat.id)}
				<div class="rounded-lg border border-border bg-card p-4 text-center">
					<dt class="text-sm text-muted-foreground">{stat.label}</dt>
					<dd class="mt-1 text-3xl font-bold text-foreground tabular-nums">{stat.value}</dd>
				</div>
			{/each}
		</dl>
	{/if}

	{#if infoHtml}
		<!-- infoHtml is sanitized on the server before it reaches the page -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div class="prose max-w-none text-foreground">{@html infoHtml}</div>
	{/if}
</section>
