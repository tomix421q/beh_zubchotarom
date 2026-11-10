<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import SaveButton from '#lib/components/atoms/SaveButton.svelte';
	import { saveStatus } from '#lib/utils/front/saveStatus.svelte.js';
	import MapEmbedInput from '#lib/components/molecules/MapEmbedInput.svelte';
	import RichTextEditor from '#lib/components/molecules/RichTextEditor.svelte';
	import { SITE_NAME } from '../../../lib/constants';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const save = saveStatus();
</script>

<svelte:head>
	<title>Kontakt · Administrácia · {SITE_NAME}</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<a href={resolve('/admin')} class="text-sm text-muted-foreground hover:text-foreground">
		← Späť na administráciu
	</a>

	<h1 class="text-2xl font-bold">Kontakt</h1>

	<section class="glassCard flex flex-col gap-4 p-6">
		<div>
			<h2 class="text-lg font-semibold">Text stránky Kontakt</h2>
			<p class="text-sm text-muted-foreground">Napíšte kontaktné údaje. Mapu pridajte nižšie.</p>
		</div>

		<form method="POST" action="?/save" use:enhance={save.submit} class="flex flex-col gap-4">
			<RichTextEditor name="html" value={data.contactHtml} />

			<MapEmbedInput name="map" value={data.contactMapUrl} />

			{#if form?.message}
				<p class="text-sm text-destructive" role="alert">{form.message}</p>
			{/if}

			<div class="flex justify-end">
				<SaveButton status={save.status} />
			</div>
		</form>
	</section>
</div>
