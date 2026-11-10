<script lang="ts">
	import { Check, LoaderCircle } from '@lucide/svelte';
	import { Button, type ButtonSize } from '#lib/components/ui/button/index.js';
	import type { SaveStatus } from '#lib/utils/front/saveStatus.svelte.js';

	// Submit button that shows the save in progress and confirms it; pair it with saveStatus() on the form.
	// All three labels share one grid cell, so the button keeps the width of the longest and never jumps
	let {
		status,
		label = 'Uložiť',
		size
	}: { status: SaveStatus; label?: string; size?: ButtonSize } = $props();
</script>

<Button type="submit" {size} disabled={status === 'saving'} data-save-button>
	<span class="grid">
		<span
			class="col-start-1 row-start-1 {status === 'idle' ? '' : 'invisible'}"
			aria-hidden={status !== 'idle'}
		>
			{label}
		</span>
		<span
			class="col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 {status ===
			'saving'
				? ''
				: 'invisible'}"
			aria-hidden={status !== 'saving'}
		>
			<LoaderCircle class="animate-spin" />
			Ukladám…
		</span>
		<span
			class="col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 {status ===
			'saved'
				? ''
				: 'invisible'}"
			aria-hidden={status !== 'saved'}
		>
			<Check />
			Uložené
		</span>
	</span>
</Button>

<!-- Screen readers hear the result without having to find the button -->
<span class="sr-only" role="status">
	{status === 'saving' ? 'Ukladám' : status === 'saved' ? 'Uložené' : ''}
</span>
