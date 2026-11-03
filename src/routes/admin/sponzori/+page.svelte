<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
	import ConfirmDeleteButton from '#lib/components/atoms/ConfirmDeleteButton.svelte';
	import Field from '#lib/components/atoms/Field.svelte';
	import { SITE_NAME } from '../../../lib/constants';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// The arrows move a sponsor only inside its own row, so each row is listed and numbered on its own
	const sponsorRows = $derived([
		{ row: 'top', label: 'Horný rad', sponsors: data.sponsors.filter((s) => s.row === 'top') },
		{ row: 'bottom', label: 'Dolný rad', sponsors: data.sponsors.filter((s) => s.row === 'bottom') }
	]);
</script>

<svelte:head>
	<title>Sponzori · Administrácia · {SITE_NAME}</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<a href={resolve('/admin')} class="text-sm text-muted-foreground hover:text-foreground">
		← Späť na administráciu
	</a>

	<h1 class="text-2xl font-bold">Sponzori</h1>

	<section class="glassCard flex flex-col gap-4 p-6">
		<div>
			<h2 class="text-lg font-semibold">Sponzori</h2>
			<p class="text-sm text-muted-foreground">
				Zobrazia sa v pätičke na všetkých stránkach, v dvoch radoch. Sponzor s logom sa zobrazí ako
				logo, bez loga ako názov. Logo: JPEG, PNG, WebP alebo AVIF do 5 MB.
			</p>
		</div>

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
									<p class="font-semibold">
										{sponsor.name}
										{#if sponsor.isMain}
											<span class="ml-2 text-sm font-normal text-muted-foreground">hlavný</span>
										{/if}
									</p>
									{#if sponsor.webUrl}
										<p class="truncate text-sm text-muted-foreground">{sponsor.webUrl}</p>
									{/if}
								</div>

								<form method="POST" use:enhance class="flex flex-wrap items-center gap-2">
									<input type="hidden" name="id" value={sponsor.id} />

									<Button type="submit" formaction="?/moveSponsorRow" variant="outline" size="sm">
										{sponsor.row === 'top' ? 'Do dolného radu' : 'Do horného radu'}
									</Button>

									<Button type="submit" formaction="?/toggleMain" variant="outline" size="sm">
										{sponsor.isMain ? 'Zrušiť hlavného' : 'Označiť ako hlavného'}
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

									<ConfirmDeleteButton
										formaction="?/deleteSponsor"
										size="sm"
										title="Zmazať sponzora?"
									/>
								</form>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}

		<!-- Shown next to the form, which sits below the whole list and would otherwise hide the message -->
		{#if form?.sponsorMessage}
			<p class="text-sm text-destructive" role="alert">{form.sponsorMessage}</p>
		{/if}

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

			<label class="flex items-center gap-2 text-sm font-medium sm:col-span-2">
				<input name="isMain" type="checkbox" class="size-4" />
				Hlavný sponzor (na stránke sa zobrazí nenápadný popis)
			</label>

			<div class="flex justify-end sm:col-span-2">
				<Button type="submit">Pridať sponzora</Button>
			</div>
		</form>
	</section>
</div>
