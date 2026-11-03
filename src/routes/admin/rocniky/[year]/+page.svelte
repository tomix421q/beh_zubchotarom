<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
	import ConfirmDeleteButton from '#lib/components/atoms/ConfirmDeleteButton.svelte';
	import Field from '#lib/components/atoms/Field.svelte';
	import RichTextEditor from '#lib/components/molecules/RichTextEditor.svelte';
	import { FIRST_EDITION_YEAR, SITE_NAME } from '../../../../lib/constants';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Ročník {data.edition.year} · Administrácia · {SITE_NAME}</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<a href={resolve('/admin')} class="text-sm text-muted-foreground hover:text-foreground">
		← Späť na administráciu
	</a>

	<h1 class="text-2xl font-bold">Ročník {data.edition.year}</h1>

	<section class="glassCard flex flex-col gap-4 p-6">
		<h2 class="text-lg font-semibold">Základné údaje</h2>

		<form method="POST" action="?/saveEdition" use:enhance class="flex flex-col gap-4">
			<div class="grid gap-4 sm:grid-cols-3">
				<Field label="Rok">
					<input
						name="year"
						type="number"
						min={FIRST_EDITION_YEAR}
						required
						value={data.edition.year}
						class="inputNormalize"
					/>
				</Field>

				<Field label="Poradové číslo">
					<input
						name="editionNumber"
						type="number"
						min="1"
						required
						value={data.edition.editionNumber}
						class="inputNormalize"
					/>
				</Field>

				<Field label="Dátum a čas (Bratislava)">
					<input
						name="eventDate"
						type="datetime-local"
						required
						value={data.eventDateInput}
						class="inputNormalize"
					/>
				</Field>
			</div>

			<Field label="Nadpis (h1)">
				<input
					name="heroTitle"
					type="text"
					value={data.edition.heroTitle ?? ''}
					placeholder={`${SITE_NAME} ${data.edition.year}`}
					class="inputNormalize"
				/>
			</Field>

			<Field label="Odkaz na fotogalériu (Google Disk)">
				<input
					name="galleryUrl"
					type="url"
					value={data.edition.galleryUrl ?? ''}
					placeholder="https://drive.google.com/..."
					class="inputNormalize"
				/>
			</Field>

			{#if form?.message}
				<p class="text-sm text-destructive" role="alert">{form.message}</p>
			{/if}

			<div class="flex justify-end">
				<Button type="submit">Uložiť</Button>
			</div>
		</form>
	</section>

	<section class="glassCard flex flex-col gap-4 p-6">
		<div>
			<h2 class="text-lg font-semibold">Výsledky</h2>
			<p class="text-sm text-muted-foreground">
				Tlačidlo „Výsledky“ sa zobrazí po dni pretekov. Nahrajte PDF (do 5 MB) alebo zadajte odkaz;
				nové výsledky nahradia pôvodné.
			</p>
		</div>

		{#if form?.resultsMessage}
			<p class="text-sm text-destructive" role="alert">{form.resultsMessage}</p>
		{/if}

		{#if data.edition.resultsUrl}
			<form method="POST" action="?/deleteResults" use:enhance class="flex items-center gap-4">
				<!-- An uploaded PDF is a path on this site; a link goes to another site -->
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a
					href={data.edition.resultsUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm underline underline-offset-4 hover:text-foreground"
				>
					{data.edition.resultsUrl.startsWith('/uploads/')
						? 'Nahraté PDF'
						: data.edition.resultsUrl}
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->

				<ConfirmDeleteButton size="sm" label="Odstrániť" confirmLabel="Naozaj odstrániť?" />
			</form>
		{:else}
			<p class="text-muted-foreground">Výsledky zatiaľ nie sú zverejnené.</p>
		{/if}

		<form
			method="POST"
			action="?/uploadResultsPdf"
			enctype="multipart/form-data"
			use:enhance
			class="flex flex-wrap items-end gap-4"
		>
			<Field label="Nahrať PDF">
				<input
					name="resultsPdf"
					type="file"
					accept="application/pdf"
					required
					class="fileInputNormalize"
				/>
			</Field>

			<Button type="submit" size="sm">Nahrať PDF</Button>
		</form>

		<form
			method="POST"
			action="?/saveResultsUrl"
			use:enhance
			class="flex flex-wrap items-end gap-4"
		>
			<Field label="Alebo odkaz na výsledky">
				<input
					name="resultsUrl"
					type="url"
					required
					placeholder="https://..."
					class="inputNormalize"
				/>
			</Field>

			<Button type="submit" size="sm">Uložiť odkaz</Button>
		</form>
	</section>

	<!-- Only the current edition takes registrations; the others never show the button -->
	{#if data.edition.isCurrent}
		<section class="glassCard flex flex-col gap-4 p-6">
			<h2 class="text-lg font-semibold">Registrácia</h2>

			<form method="POST" action="?/saveRegistration" use:enhance class="flex flex-col gap-4">
				<label class="flex items-center gap-3 text-sm font-medium">
					<input
						name="registrationOpen"
						type="checkbox"
						checked={data.edition.registrationOpen}
						class="size-4"
					/>
					Zobraziť tlačidlo „Registrovať sa“ v Hero
				</label>

				<div class="flex justify-end">
					<Button type="submit">Uložiť</Button>
				</div>
			</form>

			<a
				href={resolve('/admin/rocniky/[year]/registracia', { year: String(data.edition.year) })}
				class="text-sm underline underline-offset-4 hover:text-foreground"
			>
				Upraviť text stránky Registrácia
			</a>
		</section>
	{/if}

	<section class="glassCard flex flex-col gap-4 p-6">
		<div>
			<h2 class="text-lg font-semibold">Štatistiky</h2>
			<p class="text-sm text-muted-foreground">
				Zobrazia sa na domovskej stránke v poradí zľava doprava. Prázdny zoznam skryje sekciu.
			</p>
		</div>

		{#if form?.statMessage}
			<p class="text-sm text-destructive" role="alert">{form.statMessage}</p>
		{/if}

		{#if data.stats.length === 0}
			<p class="text-muted-foreground">Zatiaľ nie sú žiadne štatistiky.</p>
		{:else}
			<ul class="flex flex-col gap-4">
				{#each data.stats as stat, index (stat.id)}
					<li>
						<form
							method="POST"
							action="?/saveStat"
							use:enhance
							class="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
						>
							<input type="hidden" name="id" value={stat.id} />

							<Field label="Kľúč">
								<input
									name="label"
									type="text"
									required
									value={stat.label}
									class="inputNormalize"
								/>
							</Field>

							<Field label="Hodnota">
								<input
									name="value"
									type="text"
									required
									value={stat.value}
									class="inputNormalize"
								/>
							</Field>

							<div class="flex flex-wrap items-end gap-2">
								<Button type="submit">Uložiť</Button>

								<Button
									type="submit"
									formaction="?/moveStat"
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
									formaction="?/moveStat"
									name="direction"
									value="down"
									variant="ghost"
									size="icon"
									disabled={index === data.stats.length - 1}
									aria-label="Posunúť nižšie"
								>
									↓
								</Button>

								<ConfirmDeleteButton formaction="?/deleteStat" />
							</div>
						</form>
					</li>
				{/each}
			</ul>
		{/if}

		<form
			method="POST"
			action="?/addStat"
			use:enhance
			class="grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_1fr_auto]"
		>
			<Field label="Kľúč">
				<input
					name="label"
					type="text"
					required
					placeholder="Štartujúcich bežcov"
					class="inputNormalize"
				/>
			</Field>

			<Field label="Hodnota">
				<input name="value" type="text" required placeholder="312" class="inputNormalize" />
			</Field>

			<div class="flex items-end">
				<Button type="submit">Pridať</Button>
			</div>
		</form>
	</section>

	<section class="glassCard flex flex-col gap-4 p-6">
		<h2 class="text-lg font-semibold">Informácie o ročníku</h2>

		<form method="POST" action="?/saveInfo" use:enhance class="flex flex-col gap-4">
			<RichTextEditor name="html" value={data.edition.infoHtml ?? ''} />

			<div class="flex justify-end">
				<Button type="submit">Uložiť</Button>
			</div>
		</form>
	</section>
</div>
