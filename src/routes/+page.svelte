<script lang="ts">
	import Hero from '#lib/components/organism/Hero.svelte';
	import { SITE_NAME } from '../lib/constants';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{SITE_NAME} {data.edition.year}</title>
</svelte:head>

<Hero edition={data.edition} />
