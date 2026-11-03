<script lang="ts">
	import type { Edition } from '../../generated/prisma/client';
	import type { Snippet } from 'svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { formatEventDate, getCountdown } from '../../utils/dateUtils';
	import { getHeroCta } from '../../utils/front/heroCta';
	import { SITE_NAME } from '../../constants';

	// actions is an optional row of extra buttons, shown next to the CTA
	let { edition, logoUrl, actions }: { edition: Edition; logoUrl: string; actions?: Snippet } =
		$props();

	let now = $state(Date.now());

	$effect(() => {
		const timer = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(timer);
	});

	const currentDate = $derived(new Date(now));
	// Countdown runs until the event starts; the CTA switches by calendar day in getHeroCta
	const isUpcoming = $derived(currentDate < edition.eventDate);
	const countdown = $derived(getCountdown(edition.eventDate, currentDate));
	const cta = $derived(getHeroCta(edition, currentDate));
	const countdownUnits = $derived([
		{ label: 'Dní', value: countdown.days },
		{ label: 'Hodín', value: countdown.hours },
		{ label: 'Minút', value: countdown.minutes },
		{ label: 'Sekúnd', value: countdown.seconds }
	]);
</script>

<!-- wrap-break-word keeps a long title or heroTitle word inside the card instead of spilling out -->
<section class="glassCard px-6 py-12 text-center wrap-break-word sm:py-16">
	<img
		src={logoUrl}
		alt="Logo Behu Zubrohlava"
		width="300"
		height="282"
		class="mx-auto mb-6 size-32 object-contain sm:size-40"
	/>
	<p class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
		{edition.editionNumber}. ročník
	</p>
	<h1 class="mt-2 text-4xl font-extrabold text-balance text-foreground sm:text-5xl">
		{edition.heroTitle ?? `${SITE_NAME} ${edition.year}`}
	</h1>
	<p class="mt-4 text-lg text-muted-foreground">{formatEventDate(edition.eventDate)}</p>

	{#if isUpcoming}
		<ul class="mt-8 grid grid-cols-4 gap-2 sm:mx-auto sm:max-w-md sm:gap-4">
			{#each countdownUnits as unit (unit.label)}
				<li class="rounded-lg border border-border bg-card px-2 py-3">
					<span class="block text-2xl font-bold text-foreground tabular-nums">{unit.value}</span>
					<span class="block text-xs text-muted-foreground">{unit.label}</span>
				</li>
			{/each}
		</ul>
	{/if}

	{#if cta || actions}
		<div class="mt-8 flex flex-wrap justify-center gap-3">
			{#if cta}
				<Button
					href={cta.href}
					target={cta.newTab ? '_blank' : undefined}
					rel={cta.newTab ? 'noopener noreferrer' : undefined}
					size="lg"
					class="h-11 px-6 text-base"
				>
					{cta.label}
				</Button>
			{/if}
			{@render actions?.()}
		</div>
	{/if}
</section>
