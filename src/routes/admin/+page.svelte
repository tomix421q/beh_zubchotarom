<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
	import { CalendarDays, Handshake, Mail, Palette } from '@lucide/svelte';
	import { SITE_NAME } from '../../lib/constants';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// The tile classes make the bento: the first two are larger and Vzhľad is taller than the others on wide screens
	const tileClass =
		'glassCard flex flex-col gap-4 p-6 transition-colors hover:bg-card/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none';
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

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<a href={resolve('/admin/rocniky')} class="{tileClass} sm:col-span-2">
			<CalendarDays class="size-8 text-primary" aria-hidden="true" />
			<div>
				<h2 class="text-lg font-semibold">Ročníky</h2>
				<p class="text-sm text-muted-foreground">
					Vytvoriť, upraviť a zmazať ročníky, ich štatistiky, texty a registráciu.
				</p>
			</div>
			<p class="mt-auto text-sm">
				{#if data.currentEdition}
					Aktuálny: <strong>{data.currentEdition.year}</strong> ({data.currentEdition
						.editionNumber}. ročník) · spolu {data.editionCount}
				{:else}
					Zatiaľ nie je vytvorený žiadny ročník.
				{/if}
			</p>
		</a>

		<a href={resolve('/admin/vzhlad')} class="{tileClass} lg:row-span-2">
			<Palette class="size-8 text-primary" aria-hidden="true" />
			<div>
				<h2 class="text-lg font-semibold">Vzhľad</h2>
				<p class="text-sm text-muted-foreground">Logo, pozadie webu a fotky slidera.</p>
			</div>

			<div class="flex items-center gap-3">
				<img src={data.logoUrl} alt="" class="size-16 object-contain" />
				<img
					src={data.backgroundImageUrl}
					alt=""
					class="aspect-video h-16 rounded-lg border border-border object-cover"
				/>
			</div>

			<p class="mt-auto text-sm">
				Video: {data.backgroundVideoUrl ? 'nahrané' : 'nenahrané'} · fotiek v slideri: {data.photoCount}
			</p>
		</a>

		<a href={resolve('/admin/sponzori')} class={tileClass}>
			<Handshake class="size-8 text-primary" aria-hidden="true" />
			<div>
				<h2 class="text-lg font-semibold">Sponzori</h2>
				<p class="text-sm text-muted-foreground">Loga a názvy v pätičke, rady a poradie.</p>
			</div>
			<p class="mt-auto text-sm">Sponzorov: {data.sponsorCount}</p>
		</a>

		<a href={resolve('/admin/kontakt')} class="{tileClass} sm:col-span-2 lg:col-span-1">
			<Mail class="size-8 text-primary" aria-hidden="true" />
			<div>
				<h2 class="text-lg font-semibold">Kontakt</h2>
				<p class="text-sm text-muted-foreground">Text stránky Kontakt a mapa.</p>
			</div>
			<p class="mt-auto text-sm">{data.hasContact ? 'Vyplnené' : 'Zatiaľ prázdne'}</p>
		</a>
	</div>
</div>
