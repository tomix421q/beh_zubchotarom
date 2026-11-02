<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
	import { cn } from '#lib/utils/ui.js';
	import type { Sponsor } from '../../generated/prisma/client';
	import { SITE_NAME } from '../../constants';
	import SponsorMarquee from './SponsorMarquee.svelte';

	let { logoUrl, sponsors }: { logoUrl: string; sponsors: Sponsor[] } = $props();

	// Each sponsor row keeps the order set in the admin, the sponsors are already sorted
	const sponsorRows = $derived([
		sponsors.filter((sponsor) => sponsor.row === 'top'),
		sponsors.filter((sponsor) => sponsor.row === 'bottom')
	]);

	// activePrefix lets a link stay active on pages that live under another path, like /rocnik/2025 for Ročníky
	const sectionLinks = [
		{ href: resolve('/'), label: 'Domov' },
		{ href: resolve('/propozicie'), label: 'Propozície' },
		{ href: resolve('/trasy'), label: 'Trasy' },
		{ href: resolve('/rocniky'), label: 'Ročníky', activePrefix: '/rocnik' },
		{ href: resolve('/kontakt'), label: 'Kontakt' }
	];

	let isMenuOpen = $state(false);

	// resolve() can give relative links (home is "./"), so they are made absolute before comparing.
	// Home only matches exactly; the other sections also match their sub-pages
	function isActive(link: { href: string; activePrefix?: string }) {
		const path = new URL(link.href, page.url.href).pathname;

		if (path === '/') return page.url.pathname === '/';

		return page.url.pathname.startsWith(link.activePrefix ?? path);
	}
</script>

{#snippet sectionLinkItems(linkClass: string)}
	{#each sectionLinks as link (link.href)}
		{@const active = isActive(link)}
		<li>
			<a
				href={link.href}
				class={cn(
					linkClass,
					active && 'font-semibold text-foreground underline underline-offset-4'
				)}
				aria-current={active ? 'page' : undefined}
				onclick={() => (isMenuOpen = false)}>{link.label}</a
			>
		</li>
	{/each}
{/snippet}

<header class="border-b border-border bg-card backdrop-blur-md">
	<nav class="pageContainer flex items-center justify-between py-4">
		<a href={resolve('/')} class="flex items-center gap-2 text-lg font-bold text-foreground">
			<img src={logoUrl} alt="" class="size-8" />
			{SITE_NAME}
		</a>

		<Button
			variant="ghost"
			size="icon"
			class="md:hidden"
			aria-expanded={isMenuOpen}
			aria-controls="mobile-menu"
			aria-label={isMenuOpen ? 'Zavrieť menu' : 'Otvoriť menu'}
			onclick={() => (isMenuOpen = !isMenuOpen)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				aria-hidden="true"
			>
				{#if isMenuOpen}
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				{:else}
					<path d="M4 6h16" />
					<path d="M4 12h16" />
					<path d="M4 18h16" />
				{/if}
			</svg>
		</Button>

		<ul class="hidden gap-6 md:flex">
			{@render sectionLinkItems('text-muted-foreground hover:text-foreground')}
		</ul>
	</nav>

	{#if isMenuOpen}
		<ul id="mobile-menu" class="pageContainer flex flex-col border-t border-border py-2 md:hidden">
			{@render sectionLinkItems('block py-3 text-foreground')}
		</ul>
	{/if}

	{#if sponsors.length > 0}
		<div class="border-t border-border py-3">
			<SponsorMarquee rows={sponsorRows} />
		</div>
	{/if}
</header>
