<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';

	let { isPaused, label, onclick }: { isPaused: boolean; label: string; onclick: () => void } =
		$props();
</script>

<Button
	variant="ghost"
	size="icon"
	aria-label={isPaused ? `Spustiť ${label}` : `Pozastaviť ${label}`}
	{onclick}
>
	{#if isPaused}
		<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M8 5v14l11-7z" />
		</svg>
	{:else}
		<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M6 5h4v14H6zM14 5h4v14h-4z" />
		</svg>
	{/if}
</Button>
