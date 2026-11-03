<script lang="ts">
	import { Button, type ButtonSize } from '#lib/components/ui/button/index.js';

	// Used instead of window.confirm(), which some browsers (e.g. Arc) suppress, so a delete silently did nothing.
	// Render it inside the form that deletes: the dialog stays a child of that form, so its submit button sends it
	let {
		formaction,
		size,
		label = 'Zmazať',
		title = 'Naozaj zmazať?',
		description = 'Túto akciu nie je možné vrátiť.'
	}: {
		formaction?: string;
		size?: ButtonSize;
		label?: string;
		title?: string;
		description?: string;
	} = $props();

	let dialog: HTMLDialogElement | undefined = $state();
</script>

<Button type="button" variant="destructive" {size} onclick={() => dialog?.showModal()}>
	{label}
</Button>

<dialog
	bind:this={dialog}
	class="m-auto w-full max-w-sm rounded-xl border border-border bg-popover p-6 text-popover-foreground backdrop:bg-black/60 backdrop:backdrop-blur-sm"
>
	<div class="flex flex-col gap-4">
		<h2 class="text-lg font-semibold">{title}</h2>
		<p class="text-sm text-muted-foreground">{description}</p>

		<div class="flex justify-end gap-2">
			<Button type="button" variant="ghost" onclick={() => dialog?.close()}>Zrušiť</Button>
			<!-- Closing is deferred, so the submit button is still in the page when the browser sends the form -->
			<Button
				type="submit"
				{formaction}
				variant="destructive"
				onclick={() => setTimeout(() => dialog?.close())}
			>
				{label}
			</Button>
		</div>
	</div>
</dialog>
