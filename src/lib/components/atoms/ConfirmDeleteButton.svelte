<script lang="ts">
	import { Button, type ButtonSize } from '#lib/components/ui/button/index.js';

	// Used instead of window.confirm(), which some browsers (e.g. Arc) suppress, so a delete silently did nothing
	let {
		formaction,
		size,
		label = 'Zmazať',
		confirmLabel = 'Naozaj zmazať?'
	}: {
		formaction?: string;
		size?: ButtonSize;
		label?: string;
		confirmLabel?: string;
	} = $props();

	const DISARM_MS = 5000;

	let armed = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function arm() {
		armed = true;
		clearTimeout(timer);
		timer = setTimeout(disarm, DISARM_MS);
	}

	function disarm() {
		armed = false;
		clearTimeout(timer);
	}
</script>

{#if armed}
	<!-- Disarming is deferred, so the submit button is still in the page when the browser sends the form -->
	<Button
		type="submit"
		{formaction}
		variant="destructive"
		{size}
		onclick={() => setTimeout(disarm)}
	>
		{confirmLabel}
	</Button>
	<Button type="button" variant="ghost" {size} onclick={disarm}>Zrušiť</Button>
{:else}
	<Button type="button" variant="destructive" {size} onclick={arm}>{label}</Button>
{/if}
