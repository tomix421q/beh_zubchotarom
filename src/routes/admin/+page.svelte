<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '$app/forms';
	import { Button } from '#lib/components/ui/button/index.js';
	import Field from '#lib/components/atoms/Field.svelte';
	import { FIRST_EDITION_YEAR, SITE_NAME } from '../../lib/constants';
	import { formatEventDate } from '../../lib/utils/dateUtils';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let year = $state(new Date().getFullYear());
	// Suggested from the year (2015 is number 1), but the admin can still change it
	let editionNumber = $derived(year - FIRST_EDITION_YEAR + 1);

	// The arrows move a sponsor only inside its own row, so each row is listed and numbered on its own
	const sponsorRows = $derived([
		{ row: 'top', label: 'Horný rad', sponsors: data.sponsors.filter((s) => s.row === 'top') },
		{ row: 'bottom', label: 'Dolný rad', sponsors: data.sponsors.filter((s) => s.row === 'bottom') }
	]);

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
					class="fileInputNormalize"
				/>
			</Field>

			<Button type="submit" size="sm">Uložiť logo</Button>
		</form>
	</section>

	<section class="glassCard flex flex-col gap-4 p-6">
		<div>
			<h2 class="text-lg font-semibold">Fotky slidera</h2>
			<p class="text-sm text-muted-foreground">
				Zobrazia sa na domovskej stránke v poradí zľava doprava. Skryté fotky sa nezobrazia. JPEG,
				PNG, WebP alebo AVIF do 5 MB.
			</p>
		</div>

		{#if form?.photoMessage}
			<p class="text-sm text-destructive" role="alert">{form.photoMessage}</p>
		{/if}

		{#if data.photos.length === 0}
			<p class="text-muted-foreground">Zatiaľ nie sú žiadne fotky.</p>
		{:else}
			<ul class="grid gap-4 sm:grid-cols-2">
				{#each data.photos as photo, index (photo.id)}
					<li
						class={[
							'flex flex-col gap-3 rounded-xl border border-border p-3',
							!photo.isActive && 'opacity-60'
						]}
					>
						<img
							src={photo.url}
							alt={photo.alt}
							loading="lazy"
							class="aspect-video w-full rounded-lg border border-border object-cover"
						/>

						<p class="text-sm">
							{photo.alt}
							{#if !photo.isActive}
								<span class="ml-2 text-muted-foreground">skrytá</span>
							{/if}
						</p>

						<form method="POST" use:enhance class="flex flex-wrap items-center gap-2">
							<input type="hidden" name="id" value={photo.id} />

							<Button type="submit" formaction="?/toggleActive" variant="outline" size="sm">
								{photo.isActive ? 'Skryť' : 'Zobraziť'}
							</Button>

							<Button
								type="submit"
								formaction="?/movePhoto"
								name="direction"
								value="up"
								variant="ghost"
								size="icon"
								disabled={index === 0}
								aria-label="Posunúť vyššie"
							>
								↑
							</Button>

							<Button
								type="submit"
								formaction="?/movePhoto"
								name="direction"
								value="down"
								variant="ghost"
								size="icon"
								disabled={index === data.photos.length - 1}
								aria-label="Posunúť nižšie"
							>
								↓
							</Button>

							<Button
								type="submit"
								formaction="?/deletePhoto"
								variant="destructive"
								size="sm"
								onclick={(event) => {
									if (!confirm('Naozaj zmazať túto fotku?')) event.preventDefault();
								}}
							>
								Zmazať
							</Button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}

		<form
			method="POST"
			action="?/uploadPhoto"
			enctype="multipart/form-data"
			use:enhance
			class="grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_1fr_auto]"
		>
			<Field label="Fotka">
				<input
					name="photo"
					type="file"
					accept="image/jpeg,image/png,image/webp,image/avif"
					required
					class="fileInputNormalize"
				/>
			</Field>

			<Field label="Popis (alt text)">
				<input
					name="alt"
					type="text"
					required
					placeholder="Štart hlavnej trate"
					class="inputNormalize"
				/>
			</Field>

			<div class="flex items-end">
				<Button type="submit">Nahrať</Button>
			</div>
		</form>
	</section>

	<section class="glassCard flex flex-col gap-4 p-6">
		<div>
			<h2 class="text-lg font-semibold">Sponzori</h2>
			<p class="text-sm text-muted-foreground">
				Zobrazia sa v pätičke na všetkých stránkach, v dvoch radoch. Sponzor s logom sa zobrazí ako
				logo, bez loga ako názov. Logo: JPEG, PNG, WebP alebo AVIF do 5 MB.
			</p>
		</div>

		{#if form?.sponsorMessage}
			<p class="text-sm text-destructive" role="alert">{form.sponsorMessage}</p>
		{/if}

		{#each sponsorRows as sponsorRow (sponsorRow.row)}
			<div class="flex flex-col gap-3">
				<h3 class="text-sm font-semibold text-muted-foreground">{sponsorRow.label}</h3>

				{#if sponsorRow.sponsors.length === 0}
					<p class="text-muted-foreground">V tomto rade zatiaľ nie sú žiadni sponzori.</p>
				{:else}
					<ul class="grid gap-4 sm:grid-cols-2">
						{#each sponsorRow.sponsors as sponsor, index (sponsor.id)}
							<li class="flex flex-col gap-3 rounded-xl border border-border p-3">
								{#if sponsor.logoUrl}
									<img
										src={sponsor.logoUrl}
										alt=""
										loading="lazy"
										class="h-12 w-auto self-start object-contain"
									/>
								{/if}

								<div>
									<p class="font-semibold">{sponsor.name}</p>
									{#if sponsor.webUrl}
										<p class="truncate text-sm text-muted-foreground">{sponsor.webUrl}</p>
									{/if}
								</div>

								<form method="POST" use:enhance class="flex flex-wrap items-center gap-2">
									<input type="hidden" name="id" value={sponsor.id} />

									<Button type="submit" formaction="?/moveSponsorRow" variant="outline" size="sm">
										{sponsor.row === 'top' ? 'Do dolného radu' : 'Do horného radu'}
									</Button>

									<Button
										type="submit"
										formaction="?/moveSponsor"
										name="direction"
										value="up"
										variant="ghost"
										size="icon"
										disabled={index === 0}
										aria-label="Posunúť vyššie"
									>
										↑
									</Button>

									<Button
										type="submit"
										formaction="?/moveSponsor"
										name="direction"
										value="down"
										variant="ghost"
										size="icon"
										disabled={index === sponsorRow.sponsors.length - 1}
										aria-label="Posunúť nižšie"
									>
										↓
									</Button>

									<Button
										type="submit"
										formaction="?/deleteSponsor"
										variant="destructive"
										size="sm"
										onclick={(event) => {
											if (!confirm('Naozaj zmazať tohto sponzora?')) event.preventDefault();
										}}
									>
										Zmazať
									</Button>
								</form>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}

		<form
			method="POST"
			action="?/addSponsor"
			enctype="multipart/form-data"
			use:enhance
			class="grid gap-3 border-t border-border pt-4 sm:grid-cols-2"
		>
			<Field label="Názov">
				<input name="name" type="text" required placeholder="Názov firmy" class="inputNormalize" />
			</Field>

			<Field label="Web (nepovinné)">
				<input name="webUrl" type="url" placeholder="https://..." class="inputNormalize" />
			</Field>

			<Field label="Rad">
				<select name="row" class="inputNormalize">
					<option value="top">Horný rad</option>
					<option value="bottom">Dolný rad</option>
				</select>
			</Field>

			<Field label="Logo – súbor (nepovinné)">
				<input
					name="logo"
					type="file"
					accept="image/jpeg,image/png,image/webp,image/avif"
					class="fileInputNormalize"
				/>
			</Field>

			<Field label="Logo – odkaz na obrázok (nepovinné)">
				<input name="logoUrl" type="url" placeholder="https://..." class="inputNormalize" />
			</Field>

			<div class="flex justify-end sm:col-span-2">
				<Button type="submit">Pridať sponzora</Button>
			</div>
		</form>
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
