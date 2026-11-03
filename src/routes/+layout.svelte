<script lang="ts">
	import './../lib/styles/layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import AdminCorner from '#lib/components/organism/AdminCorner.svelte';
	import BackgroundMedia from '#lib/components/organism/BackgroundMedia.svelte';
	import Footer from '#lib/components/organism/Footer.svelte';
	import Navbar from '#lib/components/organism/Navbar.svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	// Cards fade in one after another in page order; this runs on load and after every navigation
	afterNavigate(() => {
		document.querySelectorAll<HTMLElement>('main .glassCard').forEach((card, index) => {
			card.style.animationDelay = `${index * 150}ms`;
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- isolate keeps the fixed background behind the page content but inside this wrapper -->
<div class="isolate min-h-dvh">
	<!-- A new video in the admin starts over, so the admin sees how it plays -->
	{#key data.backgroundVideoUrl}
		<BackgroundMedia videoUrl={data.backgroundVideoUrl} imageUrl={data.backgroundImageUrl} />
	{/key}

	<div class="dark flex min-h-dvh flex-col bg-background/60 text-foreground">
		<AdminCorner isAdmin={data.isAdmin} />
		<Navbar logoUrl={data.logoUrl} />

		<main class="pageContainer flex-1 py-6 sm:py-10">
			{@render children()}
		</main>

		{#if !page.url.pathname.startsWith('/admin')}
			<Footer sponsors={data.sponsors} />
		{/if}
	</div>
</div>
