<script lang="ts">
	type Stat = { id: number; label: string; value: string };

	let { year, stats }: { year: number; stats: Stat[] } = $props();
</script>

{#if stats.length > 0}
	<section class="glassCard p-6">
		<h2 class="mb-6 text-center text-lg font-semibold text-foreground">Ročník {year} v číslach</h2>
		<dl class="grid grid-cols-2 gap-4 sm:grid-cols-3">
			{#each stats as stat (stat.id)}
				<div class="rounded-lg border border-border bg-card p-4 text-center">
					<dt class="text-sm text-muted-foreground">{stat.label}</dt>
					<dd class="mt-1 text-3xl font-bold text-foreground tabular-nums">{stat.value}</dd>
				</div>
			{/each}
		</dl>
	</section>
{/if}
