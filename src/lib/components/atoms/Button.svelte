<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		href?: string;
		variant?: 'primary' | 'ghost';
		class?: string;
		children: Snippet;
		[attribute: string]: unknown;
	};

	let { href, variant = 'primary', class: className = '', children, ...rest }: Props = $props();

	const baseClasses =
		'inline-flex items-center justify-center rounded-md font-semibold transition-opacity';
	const variantClasses = {
		primary: 'bg-primary px-6 py-3 text-primary-foreground hover:opacity-90',
		ghost: 'p-2 text-foreground hover:bg-card'
	};
</script>

{#if href}
	<!-- href is an external URL from the edition record, not an internal route -->
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a {href} {...rest} class={[baseClasses, variantClasses[variant], className]}>
		{@render children()}
	</a>
{:else}
	<button type="button" {...rest} class={[baseClasses, variantClasses[variant], className]}>
		{@render children()}
	</button>
{/if}
