<script lang="ts">
	import type { Edition } from '../../generated/prisma/client';
	import Button from '#lib/components/atoms/Button.svelte';
	import { formatEventDate, getCountdown } from '../../utils/dateUtils';
	import { getHeroCta } from '../../utils/front/heroCta';
	import { LOGO_URL, SITE_NAME } from '../../constants';

	let { edition }: { edition: Edition } = $props();

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

<section
	class="overflow-hidden rounded-xl border border-border bg-linear-to-b from-primary/10 to-background px-6 py-12 text-center sm:py-16"
>
	<img
		src={LOGO_URL}
		alt="Logo Behu Zubrohlava"
		width="300"
		height="282"
		class="mx-auto mb-6 size-32 object-contain sm:size-40"
	/>
	<p class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
		{edition.editionNumber}. ročník
	</p>
	<h1 class="mt-2 text-4xl font-extrabold text-foreground sm:text-5xl">
		{SITE_NAME}
		{edition.year}
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

	{#if cta}
		<div class="mt-8">
			<Button href={cta.href}>{cta.label}</Button>
		</div>
	{/if}
</section>
