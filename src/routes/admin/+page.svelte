<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '#lib/components/ui/button/index.js';
	import Field from '#lib/components/atoms/Field.svelte';
	import { FIRST_EDITION_YEAR, SITE_NAME } from '../../lib/constants';
	import { formatEventDate } from '../../lib/utils/dateUtils';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let year = $state(new Date().getFullYear());
	// Suggested from the year (2015 is number 1), but the admin can still change it
	let editionNumber = $derived(year - FIRST_EDITION_YEAR + 1);
</script>

<svelte:head>
	<title>Administrácia · {SITE_NAME}</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between gap-4">
		<h1 class="text-2xl font-bold">Administrácia</h1>

		<form method="POST" action="?/logout">
			<Button type="submit" variant="outline">Odhlásiť sa</Button>
		</form>
	</div>

	{#if form?.message}
		<p class="text-sm text-destructive" role="alert">{form.message}</p>
	{/if}

	<section class="glassCard flex flex-col gap-4 p-6">
		<div>
			<h2 class="text-lg font-semibold">Ročníky</h2>
			<p class="text-sm text-muted-foreground">Aktuálny je vždy ročník s najvyšším rokom.</p>
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

							<form
								method="POST"
								action="?/deleteEdition"
								use:enhance={({ cancel }) => {
									if (
										!confirm(
											`Naozaj zmazať ročník ${edition.year}? Zmažú sa aj jeho trasy a štatistiky.`
										)
									) {
										cancel();
									}
								}}
							>
								<input type="hidden" name="id" value={edition.id} />
								<Button type="submit" variant="destructive" size="sm">Zmazať</Button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section class="glassCard flex flex-col gap-4 p-6">
		<h2 class="text-lg font-semibold">Nový ročník</h2>

		<form method="POST" action="?/createEdition" use:enhance class="flex flex-col gap-4">
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

				<Field label="Dátum a čas (Bratislava)">
					<input name="eventDate" type="datetime-local" required class="inputNormalize" />
				</Field>
			</div>

			<div class="flex justify-end">
				<Button type="submit">Vytvoriť ročník</Button>
			</div>
		</form>
	</section>

	<section class="glassCard flex flex-col gap-4 p-6">
		<div>
			<h2 class="text-lg font-semibold">Logo</h2>
			<p class="text-sm text-muted-foreground">
				Zobrazí sa v hlavičke a na domovskej stránke. JPEG, PNG, WebP alebo AVIF do 5 MB.
			</p>
		</div>

		<img src={data.logoUrl} alt="Aktuálne logo" class="size-24 object-contain" />

		<form
			method="POST"
			action="?/saveLogo"
			enctype="multipart/form-data"
			use:enhance
			class="flex flex-wrap items-end gap-4"
		>
			<Field label="Nové logo">
				<input
					name="logo"
					type="file"
					accept="image/jpeg,image/png,image/webp,image/avif"
					required
					class="text-sm"
				/>
			</Field>

			<Button type="submit">Uložiť logo</Button>
		</form>
	</section>
</div>
