<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';

	let { isAdmin }: { isAdmin: boolean } = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	let errorMessage = $state('');

	const triggerClass =
		'fixed top-0 left-0 z-50 size-4 cursor-pointer bg-foreground opacity-0 outline-none hover:opacity-20 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring';

	const submitLogin: SubmitFunction = () => {
		errorMessage = '';

		return async ({ result, update }) => {
			if (result.type === 'failure') errorMessage = String(result.data?.message ?? '');

			await update();
		};
	};
</script>

{#if isAdmin}
	<a href={resolve('/admin' as '/')} class={triggerClass}>
		<span class="sr-only">Administrácia</span>
	</a>
{:else}
	<button type="button" class={triggerClass} onclick={() => dialog?.showModal()}>
		<span class="sr-only">Administrácia</span>
	</button>

	<dialog
		bind:this={dialog}
		class="m-auto w-full max-w-sm rounded-xl border border-border bg-popover p-6 text-popover-foreground backdrop:bg-black/60 backdrop:backdrop-blur-sm"
	>
		<form
			method="POST"
			action="/admin?/login"
			use:enhance={submitLogin}
			class="flex flex-col gap-4"
		>
			<h2 class="text-lg font-semibold">Administrácia</h2>

			<label class="flex flex-col gap-2 text-sm font-medium">
				Heslo
				<input
					name="password"
					type="password"
					required
					autocomplete="current-password"
					class="inputNormalize"
				/>
			</label>

			{#if errorMessage}
				<p class="text-sm text-destructive" role="alert">{errorMessage}</p>
			{/if}

			<div class="flex justify-end gap-2">
				<Button type="button" variant="ghost" onclick={() => dialog?.close()}>Zavrieť</Button>
				<Button type="submit">Prihlásiť sa</Button>
			</div>
		</form>
	</dialog>
{/if}
