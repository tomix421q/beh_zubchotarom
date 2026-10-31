<script lang="ts">
	import Button from '../atoms/Button.svelte';
	import PauseButton from '../atoms/PauseButton.svelte';

	type Photo = { id: number; url: string; alt: string };

	let { photos }: { photos: Photo[] } = $props();

	const INTERVAL_MS = 6000;

	let index = $state(0);
	let isPausedByUser = $state(false);
	let isHovered = $state(false);
	let hasFocus = $state(false);
	let prefersReducedMotion = $state(false);

	// Hover and touch both count as pointer enter, so touching the slider pauses it until the finger lifts
	const isPaused = $derived(isPausedByUser || isHovered || hasFocus || prefersReducedMotion);

	$effect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = query.matches;

		const onChange = () => (prefersReducedMotion = query.matches);
		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	});

	$effect(() => {
		if (isPaused || photos.length < 2) return;

		const timer = setInterval(() => (index = (index + 1) % photos.length), INTERVAL_MS);
		return () => clearInterval(timer);
	});

	function showPhoto(position: number) {
		index = (position + photos.length) % photos.length;
	}
</script>

<section
	aria-roledescription="carousel"
	aria-label="Fotografie z pretekov"
	class="flex flex-col gap-3"
	onpointerenter={() => (isHovered = true)}
	onpointerleave={() => (isHovered = false)}
	onfocusin={() => (hasFocus = true)}
	onfocusout={() => (hasFocus = false)}
>
	<div class="relative aspect-video overflow-hidden rounded-xl border border-border bg-card">
		{#each photos as photo, position (photo.id)}
			<img
				src={photo.url}
				alt={photo.alt}
				aria-hidden={position !== index}
				loading="lazy"
				class={[
					'absolute inset-0 size-full object-cover transition-opacity duration-700',
					position === index ? 'opacity-100' : 'opacity-0'
				]}
			/>
		{/each}
	</div>

	<div class="flex items-center justify-between gap-3">
		<div class="flex items-center gap-1">
			<Button
				variant="ghost"
				aria-label="Predchádzajúca fotka"
				onclick={() => showPhoto(index - 1)}
			>
				&lsaquo;
			</Button>
			<Button variant="ghost" aria-label="Ďalšia fotka" onclick={() => showPhoto(index + 1)}>
				&rsaquo;
			</Button>
		</div>

		<div class="flex items-center gap-2">
			{#each photos as photo, position (photo.id)}
				<button
					type="button"
					aria-label="Fotka {position + 1} z {photos.length}"
					aria-current={position === index}
					class="size-2.5 rounded-full bg-muted-foreground/40 aria-[current=true]:bg-primary"
					onclick={() => showPhoto(position)}
				></button>
			{/each}
		</div>

		<PauseButton
			isPaused={isPausedByUser}
			label="slider"
			onclick={() => (isPausedByUser = !isPausedByUser)}
		/>
	</div>
</section>
