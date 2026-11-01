<script lang="ts">
	import type { Snippet } from 'svelte';

	// The input is passed as children so the caller keeps bind:value, which a generic spread would break
	let { label, children }: { label: string; children: Snippet } = $props();
</script>

<label class="flex flex-col gap-2 text-sm font-medium">
	{label}
	{@render children()}
</label>
