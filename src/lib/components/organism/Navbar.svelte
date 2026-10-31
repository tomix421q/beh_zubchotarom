<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/atoms/Button.svelte';
	import { LOGO_URL, SITE_NAME } from '../../constants';

	const sectionLinks = [
		{ href: resolve('/propozicie'), label: 'Propozície' },
		{ href: resolve('/trasy'), label: 'Trasy' },
		{ href: resolve('/vysledky'), label: 'Výsledky' },
		{ href: resolve('/kontakt'), label: 'Kontakt' }
	];

	let isMenuOpen = $state(false);
</script>

{#snippet sectionLinkItems(linkClass: string)}
	{#each sectionLinks as link (link.href)}
		<li>
			<a href={link.href} class={linkClass} onclick={() => (isMenuOpen = false)}>{link.label}</a>
		</li>
	{/each}
{/snippet}

<header class="border-b border-border">
	<nav class="pageContainer flex items-center justify-between py-4">
		<a href={resolve('/')} class="flex items-center gap-2 text-lg font-bold text-foreground">
			<img src={LOGO_URL} alt="" class="size-8" />
			{SITE_NAME}
		</a>

		<Button
			variant="ghost"
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
</header>
