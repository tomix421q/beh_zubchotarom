<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import SaveButton from '#lib/components/atoms/SaveButton.svelte';
	import { saveStatus } from '#lib/utils/front/saveStatus.svelte.js';
	import RichTextEditor from '#lib/components/molecules/RichTextEditor.svelte';
	import { SITE_NAME } from '../../../lib/constants';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const save = saveStatus();
</script>

<svelte:head>
	<title>O nás · Administrácia · {SITE_NAME}</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<a href={resolve('/admin')} class="text-sm text-muted-foreground hover:text-foreground">
		← Späť na administráciu
	</a>

	<h1 class="text-2xl font-bold">O nás</h1>

	<section class="glassCard flex flex-col gap-4 p-6">
		<div>
			<h2 class="text-lg font-semibold">Text stránky O nás</h2>
			<p class="text-sm text-muted-foreground">Napíšte príbeh klubu a zakladateľov.</p>
		</div>

		<form method="POST" action="?/save" use:enhance={save.submit} class="flex flex-col gap-4">
			<RichTextEditor name="html" value={data.aboutHtml} />

			<div class="flex justify-end">
				<SaveButton status={save.status} />
			</div>
		</form>
	</section>
</div>
