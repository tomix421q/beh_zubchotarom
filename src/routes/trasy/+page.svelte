<script lang="ts">
	import { SITE_NAME } from '../../lib/constants';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Trasy · {SITE_NAME}</title>
</svelte:head>

<section class="glassCard flex flex-col gap-6 p-6">
	<h1 class="text-3xl font-bold text-foreground">Trasy</h1>
	{#if data.edition.routes.length > 0}
		<ul class="grid gap-4 sm:grid-cols-2">
			{#each data.edition.routes as route (route.id)}
				<li class="rounded-lg border border-border bg-card p-4">
					<p class="text-lg font-semibold text-foreground">{route.name}</p>
					<p class="text-muted-foreground">
						{route.distanceKm} km{route.elevationM !== null
							? `, prevýšenie ${route.elevationM} m`
							: ''}
					</p>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-muted-foreground">Trasy budú zverejnené čoskoro.</p>
	{/if}
</section>
