<script lang="ts">
	import { untrack } from 'svelte';
	import Field from '#lib/components/atoms/Field.svelte';
	import MapEmbed from '#lib/components/atoms/MapEmbed.svelte';
	import { parseMapEmbedUrl } from '#lib/utils/googleMaps.js';

	let {
		name,
		value = '',
		label = 'Mapa (Google Maps)'
	}: { name: string; value?: string; label?: string } = $props();

	let text = $state(untrack(() => value));
	const url = $derived(parseMapEmbedUrl(text));
</script>

<div class="flex flex-col gap-3">
	<Field {label}>
		<textarea
			{name}
			bind:value={text}
			rows="3"
			placeholder="Vložte kód z Google Maps (Zdieľať → Vložiť mapu) alebo len adresu z src"
			class="inputNormalize"></textarea>
	</Field>

	{#if url}
		<MapEmbed {url} title="Náhľad mapy" />
	{:else if text.trim()}
		<p class="text-sm text-destructive" role="alert">
			Toto nie je kód na vloženie mapy z Google Maps. Použite Zdieľať → Vložiť mapu a skopírujte
			celý kód.
		</p>
	{:else}
		<p class="text-sm text-muted-foreground">Nepovinné. Bez mapy sa zobrazí len text.</p>
	{/if}
</div>
