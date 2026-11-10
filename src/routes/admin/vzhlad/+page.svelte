<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
	import ConfirmDeleteButton from '#lib/components/atoms/ConfirmDeleteButton.svelte';
	import Field from '#lib/components/atoms/Field.svelte';
	import SaveButton from '#lib/components/atoms/SaveButton.svelte';
	import { saveStatus } from '#lib/utils/front/saveStatus.svelte.js';
	import { SITE_NAME } from '../../../lib/constants';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// One tracker per form, so only the button that was pressed confirms the save
	const logoSave = saveStatus();
	const videoSave = saveStatus();
	const imageSave = saveStatus();
	const photoSave = saveStatus();
</script>

<svelte:head>
	<title>Vzhľad · Administrácia · {SITE_NAME}</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<a href={resolve('/admin')} class="text-sm text-muted-foreground hover:text-foreground">
		← Späť na administráciu
	</a>

	<h1 class="text-2xl font-bold">Vzhľad</h1>

	{#if form?.message}
		<p class="text-sm text-destructive" role="alert">{form.message}</p>
	{/if}

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
			use:enhance={logoSave.submit}
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

			<SaveButton status={logoSave.status} label="Uložiť logo" size="sm" />
		</form>
	</section>

	<section class="glassCard flex flex-col gap-6 p-6">
		<div>
			<h2 class="text-lg font-semibold">Pozadie</h2>
			<p class="text-sm text-muted-foreground">
				Pozadie celého webu. Video sa po načítaní stránky raz prehrá a zostane na poslednom zábere.
				Obrázok sa zobrazí, kým sa video načíta, a vtedy, keď sa video nedá prehrať. Bez nahraného
				obrázka sa použije predvolené pozadie.
			</p>
		</div>

		{#if form?.backgroundMessage}
			<p class="text-sm text-destructive" role="alert">{form.backgroundMessage}</p>
		{/if}

		<div class="flex flex-col gap-3">
			<h3 class="font-semibold">Video</h3>
			<p class="text-sm text-muted-foreground">
				mp4 (H.264) bez zvuku, do 5 MB, zakódované s parametrom <code>-movflags +faststart</code>.
				Čím je súbor menší, tým rýchlejšie sa načíta.
			</p>

			{#if data.backgroundVideoUrl}
				<video
					src={data.backgroundVideoUrl}
					muted
					controls
					preload="metadata"
					class="aspect-video max-w-sm rounded-xl border border-border"
				></video>

				<form method="POST" action="?/deleteBackgroundVideo" use:enhance>
					<ConfirmDeleteButton
						size="sm"
						title="Zmazať video pozadia?"
						description="Na pozadí zostane len obrázok. Túto akciu nie je možné vrátiť."
					/>
				</form>
			{:else}
				<p class="text-sm text-muted-foreground">Video nie je nahrané.</p>
			{/if}

			<form
				method="POST"
				action="?/uploadBackgroundVideo"
				enctype="multipart/form-data"
				use:enhance={videoSave.submit}
				class="flex flex-wrap items-end gap-4"
			>
				<Field label={data.backgroundVideoUrl ? 'Nové video' : 'Video'}>
					<input name="video" type="file" accept="video/mp4" required class="fileInputNormalize" />
				</Field>

				<SaveButton status={videoSave.status} label="Uložiť video" size="sm" />
			</form>
		</div>

		<div class="flex flex-col gap-3">
			<h3 class="font-semibold">Obrázok</h3>
			<p class="text-sm text-muted-foreground">JPEG, PNG, WebP alebo AVIF do 5 MB.</p>

			<img
				src={data.backgroundImageUrl}
				alt="Aktuálne pozadie"
				class="aspect-video max-w-sm rounded-xl border border-border object-cover"
			/>

			{#if data.backgroundImageUrl.startsWith('/uploads/')}
				<form method="POST" action="?/deleteBackgroundImage" use:enhance>
					<ConfirmDeleteButton
						size="sm"
						title="Zmazať obrázok pozadia?"
						description="Použije sa predvolené pozadie. Túto akciu nie je možné vrátiť."
					/>
				</form>
			{/if}

			<form
				method="POST"
				action="?/uploadBackgroundImage"
				enctype="multipart/form-data"
				use:enhance={imageSave.submit}
				class="flex flex-wrap items-end gap-4"
			>
				<Field label="Nový obrázok">
					<input
						name="image"
						type="file"
						accept="image/jpeg,image/png,image/webp,image/avif"
						required
						class="fileInputNormalize"
					/>
				</Field>

				<SaveButton status={imageSave.status} label="Uložiť obrázok" size="sm" />
			</form>
		</div>
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

							<ConfirmDeleteButton formaction="?/deletePhoto" size="sm" title="Zmazať fotku?" />
						</form>
					</li>
				{/each}
			</ul>
		{/if}

		<form
			method="POST"
			action="?/uploadPhoto"
			enctype="multipart/form-data"
			use:enhance={photoSave.submit}
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
				<SaveButton status={photoSave.status} label="Nahrať" />
			</div>
		</form>
	</section>
</div>
