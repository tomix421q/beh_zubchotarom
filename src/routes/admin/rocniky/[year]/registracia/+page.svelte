<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
	import RichTextEditor from '#lib/components/molecules/RichTextEditor.svelte';
	import { SITE_NAME } from '../../../../../lib/constants';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Registrácia {data.edition.year} · Administrácia · {SITE_NAME}</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<a
		href={resolve('/admin/rocniky/[year]', { year: String(data.edition.year) })}
		class="text-sm text-muted-foreground hover:text-foreground"
	>
		← Späť na ročník {data.edition.year}
	</a>

	<h1 class="text-2xl font-bold">Registrácia · ročník {data.edition.year}</h1>

	<section class="glassCard flex flex-col gap-4 p-6">
		<h2 class="text-lg font-semibold">Text stránky Registrácia</h2>

		<form method="POST" action="?/save" use:enhance class="flex flex-col gap-4">
			<RichTextEditor name="html" value={data.edition.registrationHtml ?? ''} />

			{#if form?.saved}
				<p class="text-sm text-muted-foreground" role="status">Uložené.</p>
			{/if}

			<div class="flex justify-end">
				<Button type="submit">Uložiť</Button>
			</div>
		</form>
	</section>
</div>
