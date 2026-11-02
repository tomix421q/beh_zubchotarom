<script lang="ts">
	type Sponsor = { id: number; name: string; logoUrl: string | null; webUrl: string | null };

	// The first row moves left and the second moves right; both run all the time
	let { rows }: { rows: Sponsor[][] } = $props();

	const directions = ['animate-marquee-left', 'animate-marquee-right'] as const;
</script>

{#snippet sponsorBadge(sponsor: Sponsor)}
	<!-- Every sponsor gets the same card as the other sections; the name is shown only when there is no logo -->
	<div class="glassCard flex h-20 w-44 items-center justify-center px-4">
		{#if sponsor.logoUrl}
			<img
				src={sponsor.logoUrl}
				alt={sponsor.name}
				class="max-h-12 w-auto max-w-full object-contain"
			/>
		{:else}
			<span class="text-center text-sm font-semibold text-foreground">{sponsor.name}</span>
		{/if}
	</div>
{/snippet}

{#snippet sponsorItems(sponsors: Sponsor[])}
	{#each sponsors as sponsor (sponsor.id)}
		<li class="shrink-0 px-3">
			{#if sponsor.webUrl}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={sponsor.webUrl} target="_blank" rel="noopener noreferrer">
					{@render sponsorBadge(sponsor)}
				</a>
			{:else}
				{@render sponsorBadge(sponsor)}
			{/if}
		</li>
	{/each}
{/snippet}

<section aria-label="Partneri a sponzori" class="flex flex-col gap-3 overflow-hidden">
	{#each rows as row, rowIndex (rowIndex)}
		{#if row.length > 0}
			<div class="overflow-hidden">
				<div class={['flex w-max motion-reduce:animate-none', directions[rowIndex]]}>
					<ul class="flex items-center">{@render sponsorItems(row)}</ul>
					<!-- The copy only keeps the loop seamless, so it is hidden from keyboard and screen readers -->
					<ul class="flex items-center" aria-hidden="true" inert>{@render sponsorItems(row)}</ul>
				</div>
			</div>
		{/if}
	{/each}
</section>
