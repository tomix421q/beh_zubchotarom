<script lang="ts">
	type Sponsor = {
		id: number;
		name: string;
		logoUrl: string | null;
		webUrl: string | null;
		isMain: boolean;
	};

	// The first row moves left and the second moves right; both run all the time
	let { rows }: { rows: Sponsor[][] } = $props();

	const directions = ['animate-marquee-left', 'animate-marquee-right'] as const;

	// Widths of each row's viewport and of its sponsors, measured in the browser to decide whether the row scrolls
	let viewportWidths: number[] = $state([0, 0]);
	let trackWidths: number[] = $state([0, 0]);
</script>

{#snippet sponsorBadge(sponsor: Sponsor)}
	<!-- The logo box has a fixed height, so logos line up even when a main sponsor label sits below them -->
	<div class="flex flex-col items-center gap-1">
		<div class="flex h-20 items-center justify-center">
			{#if sponsor.logoUrl}
				<img
					src={sponsor.logoUrl}
					alt={sponsor.name}
					class="max-h-20 w-auto max-w-60 object-contain"
				/>
			{:else}
				<span class="text-center text-base font-semibold text-foreground">{sponsor.name}</span>
			{/if}
		</div>
		{#if sponsor.isMain}
			<span class="text-xs text-muted-foreground">Hlavný sponzor</span>
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
			<!-- A row only scrolls when its sponsors are wider than the footer; otherwise it stays still and centred, without a copy -->
			{@const scrolls = trackWidths[rowIndex] > viewportWidths[rowIndex]}
			<div class="overflow-hidden" bind:clientWidth={viewportWidths[rowIndex]}>
				<div
					class={[
						'flex w-max',
						scrolls ? ['motion-reduce:animate-none', directions[rowIndex]] : 'mx-auto'
					]}
				>
					<ul class="flex items-start" bind:clientWidth={trackWidths[rowIndex]}>
						{@render sponsorItems(row)}
					</ul>
					{#if scrolls}
						<!-- The copy only keeps the loop seamless, so it is hidden from keyboard and screen readers -->
						<ul class="flex items-start" aria-hidden="true" inert>{@render sponsorItems(row)}</ul>
					{/if}
				</div>
			</div>
		{/if}
	{/each}
</section>
