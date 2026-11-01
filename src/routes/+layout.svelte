<script lang="ts">
	import './../lib/styles/layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import AdminCorner from '#lib/components/organism/AdminCorner.svelte';
	import Navbar from '#lib/components/organism/Navbar.svelte';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-dvh bg-[url(/bg.jpg)] bg-cover bg-center">
	<div class="dark flex min-h-dvh flex-col bg-background/60 text-foreground">
		<AdminCorner isAdmin={data.isAdmin} />
		<Navbar />

		<main class="pageContainer flex-1 py-6 sm:py-10">
			{@render children()}
		</main>
	</div>
</div>
