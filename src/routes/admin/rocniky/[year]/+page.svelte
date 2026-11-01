<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
	import Field from '#lib/components/atoms/Field.svelte';
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

			{#if form?.message}
				<p class="text-sm text-destructive" role="alert">{form.message}</p>
			{/if}

			<div class="flex justify-end">
				<Button type="submit">Uložiť</Button>
			</div>
		</form>
	</section>
</div>
