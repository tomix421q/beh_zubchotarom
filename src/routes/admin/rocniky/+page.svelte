<script lang="ts">
	import type { SubmitFunction } from '$app/forms';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
	import ConfirmDeleteButton from '#lib/components/atoms/ConfirmDeleteButton.svelte';
	import Field from '#lib/components/atoms/Field.svelte';
	import { FIRST_EDITION_YEAR } from '../../../lib/constants';
	import { formatEventDate } from '../../../lib/utils/dateUtils';
	import { SITE_NAME } from '../../../lib/constants';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let year = $state(new Date().getFullYear());
	// Suggested from the year (2015 is number 1), but the admin can still change it
	let editionNumber = $derived(year - FIRST_EDITION_YEAR + 1);

	let createDialog: HTMLDialogElement | undefined = $state();
	let createMessage = $state('');

	// The message is shown inside the dialog, because the page behind it is covered
	const submitCreate: SubmitFunction = () => {
		createMessage = '';

		return async ({ result, update }) => {
			if (result.type === 'failure') createMessage = String(result.data?.message ?? '');

			await update();
		};
	};
</script>

<svelte:head>
	<title>Ročníky · Administrácia · {SITE_NAME}</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<a href={resolve('/admin')} class="text-sm text-muted-foreground hover:text-foreground">
		← Späť na administráciu
	</a>

	<h1 class="text-2xl font-bold">Ročníky</h1>

	{#if form?.message}
		<p class="text-sm text-destructive" role="alert">{form.message}</p>
	{/if}

	<section class="glassCard flex flex-col gap-4 p-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<h2 class="text-lg font-semibold">Ročníky</h2>
				<p class="text-sm text-muted-foreground">Aktuálny je vždy ročník s najvyšším rokom.</p>
			</div>

			<Button
				size="sm"
				onclick={() => {
					createMessage = '';
					createDialog?.showModal();
				}}
			>
				Nový ročník
			</Button>
		</div>

		{#if data.editions.length === 0}
			<p class="text-muted-foreground">Zatiaľ nie je vytvorený žiadny ročník.</p>
		{:else}
			<ul class="flex flex-col divide-y divide-border">
				{#each data.editions as edition (edition.id)}
					<li class="flex flex-wrap items-center justify-between gap-3 py-3">
						<div>
							<p class="font-semibold">
								{SITE_NAME}
								{edition.year}
								{#if edition.isCurrent}
									<span class="ml-2 text-sm font-normal text-muted-foreground">aktuálny</span>
								{/if}
							</p>
							<p class="text-sm text-muted-foreground">
								{edition.editionNumber}. ročník · {formatEventDate(edition.eventDate)}
							</p>
						</div>

						<div class="flex flex-wrap gap-2">
							<Button href={`/admin/rocniky/${edition.year}`} variant="ghost" size="sm">
								Upraviť
							</Button>

							<form method="POST" action="?/deleteEdition" use:enhance class="flex gap-2">
								<input type="hidden" name="id" value={edition.id} />
								<ConfirmDeleteButton
									size="sm"
									title="Zmazať ročník {edition.year}?"
									description="Zmažú sa aj jeho trasy a štatistiky. Túto akciu nie je možné vrátiť."
								/>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<dialog
		bind:this={createDialog}
		class="m-auto w-full max-w-lg rounded-xl border border-border bg-popover p-6 text-popover-foreground backdrop:bg-black/60 backdrop:backdrop-blur-sm"
	>
		<form
			method="POST"
			action="?/createEdition"
			use:enhance={submitCreate}
			class="flex flex-col gap-4"
		>
			<h2 class="text-lg font-semibold">Nový ročník</h2>

			<div class="grid gap-4 sm:grid-cols-3">
				<Field label="Rok">
					<input
						name="year"
						type="number"
						min={FIRST_EDITION_YEAR}
						required
						bind:value={year}
						class="inputNormalize"
					/>
				</Field>

				<Field label="Poradové číslo">
					<input
						name="editionNumber"
						type="number"
						min="1"
						required
						bind:value={editionNumber}
						class="inputNormalize"
					/>
				</Field>

				<Field label="Dátum a čas">
					<input name="eventDate" type="datetime-local" required class="inputNormalize" />
				</Field>
			</div>

			{#if createMessage}
				<p class="text-sm text-destructive" role="alert">{createMessage}</p>
			{/if}

			<div class="flex justify-end gap-2">
				<Button type="button" variant="ghost" onclick={() => createDialog?.close()}>Zavrieť</Button>
				<Button type="submit">Vytvoriť ročník</Button>
			</div>
		</form>
	</dialog>
</div>
